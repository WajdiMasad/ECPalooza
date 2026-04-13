$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 3000
$localIP = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.PrefixOrigin -ne "WellKnown" } |
    Select-Object -First 1).IPAddress

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://+:$port/")
$listener.Start()

Write-Host ""
Write-Host "  EC Palooza local server running!" -ForegroundColor Cyan
Write-Host "  Local:    http://localhost:$port" -ForegroundColor Yellow
Write-Host "  Network:  http://${localIP}:$port" -ForegroundColor Yellow
Write-Host "  Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host ""

$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.gif'  = 'image/gif'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
    '.webp' = 'image/webp'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
}

try {
    while ($listener.IsListening) {
        $ctx  = $listener.GetContext()
        $req  = $ctx.Request
        $res  = $ctx.Response

        $localPath = $req.Url.LocalPath
        if ($localPath -eq '/') { $localPath = '/index.html' }

        $filePath = Join-Path $root ($localPath.TrimStart('/').Replace('/', '\'))

        if (Test-Path $filePath -PathType Leaf) {
            $ext      = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime     = if ($mimeTypes[$ext]) { $mimeTypes[$ext] } else { 'application/octet-stream' }
            $bytes    = [System.IO.File]::ReadAllBytes($filePath)
            $res.StatusCode        = 200
            $res.ContentType       = $mime
            $res.ContentLength64   = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "  200  $localPath" -ForegroundColor Green
        } else {
            $msg   = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found: $localPath")
            $res.StatusCode        = 404
            $res.ContentType       = 'text/plain'
            $res.ContentLength64   = $msg.Length
            $res.OutputStream.Write($msg, 0, $msg.Length)
            Write-Host "  404  $localPath" -ForegroundColor Red
        }

        $res.OutputStream.Close()
    }
} finally {
    $listener.Stop()
    Write-Host "Server stopped." -ForegroundColor Gray
}
