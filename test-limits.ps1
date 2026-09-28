foreach ($i in 1..10) {
    $body = @{
        eventId = "test_evt_$i"
        source = "test"
        eventType = "test.event"
        payload = @{}
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5001/webhooks/test" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $body -ErrorAction Stop
        Write-Host "Request $i - HTTP Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if (-not $statusCode) {
            $statusCode = $_.Response.StatusCode.value__
        }
        Write-Host "Request $i - BLOCKED / HTTP Status: $statusCode" -ForegroundColor Red
    }
}