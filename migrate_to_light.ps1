$files = Get-ChildItem -Path "frontend/src/views", "frontend/src/components" -Include *.vue -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $newContent = $content -replace 'text-white', 'text-gray-900' `
                           -replace 'text-white/90', 'text-gray-800' `
                           -replace 'text-white/80', 'text-gray-700' `
                           -replace 'text-white/70', 'text-gray-600' `
                           -replace 'text-white/60', 'text-gray-500' `
                           -replace 'text-white/50', 'text-gray-400' `
                           -replace 'bg-gray-800', 'bg-white' `
                           -replace 'bg-gray-900', 'bg-gray-50' `
                           -replace 'border-white/10', 'border-gray-200' `
                           -replace 'border-white/20', 'border-gray-300' `
                           -replace 'border-white/5', 'border-gray-100' `
                           -replace 'bg-white/10', 'bg-gray-100' `
                           -replace 'bg-white/20', 'bg-gray-200' `
                           -replace 'bg-white/5', 'bg-gray-50' `
                           -replace 'hover:bg-white/10', 'hover:bg-gray-100' `
                           -replace 'hover:bg-white/20', 'hover:bg-gray-200'

    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Updated $($file.Name)"
    }
}
