# Script to download logos for all major LLM companies
$logoDir = "public/logos"
if (-not (Test-Path $logoDir)) {
    New-Item -ItemType Directory -Path $logoDir -Force
}

# List of major LLM companies and their logo URLs
$logos = @(
    @{Name="openai"; Url="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"},
    @{Name="anthropic"; Url="https://www.anthropic.com/favicon.ico"},
    @{Name="google"; Url="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"},
    @{Name="meta"; Url="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg"},
    @{Name="mistral"; Url="https://mistral.ai/favicon.ico"},
    @{Name="cohere"; Url="https://cohere.com/favicon.ico"},
    @{Name="microsoft"; Url="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"},
    @{Name="deepseek"; Url="https://www.deepseek.com/favicon.ico"},
    @{Name="huggingface"; Url="https://huggingface.co/favicon.ico"},
    @{Name="xai"; Url="https://x.ai/favicon.ico"},
    @{Name="baidu"; Url="https://www.baidu.com/favicon.ico"},
    @{Name="alibaba"; Url="https://www.alibaba.com/favicon.ico"},
    @{Name="nvidia"; Url="https://www.nvidia.com/favicon.ico"},
    @{Name="amazon"; Url="https://www.amazon.com/favicon.ico"},
    @{Name="apple"; Url="https://www.apple.com/favicon.ico"},
    @{Name="stability"; Url="https://stability.ai/favicon.ico"},
    @{Name="together"; Url="https://together.ai/favicon.ico"},
    @{Name="perplexity"; Url="https://www.perplexity.ai/favicon.ico"},
    @{Name="01ai"; Url="https://www.01.ai/favicon.ico"},
    @{Name="qwen"; Url="https://qwenlm.github.io/favicon.ico"},
    @{Name="internlm"; Url="https://github.com/InternLM/favicon.ico"},
    @{Name="baichuan"; Url="https://www.baichuan-ai.com/favicon.ico"}
)

foreach ($logo in $logos) {
    $fileName = "$($logo.Name).ico"
    $filePath = Join-Path $logoDir $fileName
    
    try {
        Write-Host "Downloading $($logo.Name)..."
        Invoke-WebRequest -Uri $logo.Url -OutFile $filePath -ErrorAction Stop
        Write-Host "✓ Downloaded $fileName"
    } catch {
        Write-Host "✗ Failed to download $($logo.Name): $_"
        # Try alternative: download as PNG
        try {
            $filePath = Join-Path $logoDir "$($logo.Name).png"
            Invoke-WebRequest -Uri $logo.Url -OutFile $filePath -ErrorAction Stop
            Write-Host "✓ Downloaded as PNG: $($logo.Name).png"
        } catch {
            Write-Host "✗ Failed to download $($logo.Name) as PNG"
        }
    }
}

Write-Host "`nLogo download complete!"

