param(
    [string]$ModelDir = (Join-Path $PSScriptRoot "..\\models\\vieneu"),

    [string]$BindHost = "127.0.0.1",

    [int]$Port = 8000,

    [string]$BackboneFile = "vieneu-tts-v2-turbo.gguf",

    [string]$DecoderFile = "vieneu_decoder.onnx",

    [string]$EncoderFile = "vieneu_encoder.onnx"
)

$resolvedModelDir = (Resolve-Path -LiteralPath $ModelDir).Path
$backbonePath = Join-Path $resolvedModelDir $BackboneFile
$decoderPath = Join-Path $resolvedModelDir $DecoderFile
$encoderPath = Join-Path $resolvedModelDir $EncoderFile
$voicesPath = Join-Path $resolvedModelDir "voices.json"

$requiredPaths = @(
    @{ Label = "Turbo GGUF"; Path = $backbonePath },
    @{ Label = "Decoder ONNX"; Path = $decoderPath },
    @{ Label = "Voices"; Path = $voicesPath }
)

foreach ($item in $requiredPaths) {
    if (-not (Test-Path -LiteralPath $item.Path)) {
        throw "$($item.Label) not found: $($item.Path)"
    }
}

if (-not (Test-Path -LiteralPath $encoderPath)) {
    Write-Warning "Encoder ONNX not found: $encoderPath"
    Write-Warning "Clone voice co the bi gioi han trong turbo mode."
}

$env:TTS_ENGINE_BACKEND = "vieneu"
$env:TTS_API_HOST = $BindHost
$env:TTS_API_PORT = "$Port"
$env:TTS_VIENEU_BACKBONE_REPO = $backbonePath
$env:TTS_VIENEU_BACKBONE_FILENAME = $backbonePath
$env:TTS_VIENEU_DECODER_REPO = $decoderPath
$env:TTS_VIENEU_DECODER_FILENAME = $decoderPath
$env:TTS_VIENEU_ENCODER_REPO = $encoderPath
$env:TTS_VIENEU_ENCODER_FILENAME = $encoderPath

Write-Host "Starting VieNeu local API with model dir: $resolvedModelDir"
Write-Host "Host: $BindHost"
Write-Host "Port: $Port"

py -3 -m backend.server
