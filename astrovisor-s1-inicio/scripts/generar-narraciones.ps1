param(
  [Parameter(Mandatory=$true)][string]$Piper,
  [Parameter(Mandatory=$true)][string]$Modelo
)
$ErrorActionPreference = 'Stop'
$s3Raiz = Split-Path $PSScriptRoot -Parent
$s3Destino = Join-Path $s3Raiz 'frontend/public/audio'
$s3Guiones = Get-Content -LiteralPath (Join-Path $s3Raiz 'content/recorridos.json') -Raw | ConvertFrom-Json
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = $OutputEncoding
foreach ($s3Guion in $s3Guiones) {
  $s3Salida = Join-Path $s3Destino ($s3Guion.id + '.wav')
  $s3Guion.historia | & $Piper --model $Modelo --output_file $s3Salida --length_scale 1.12
  if ($LASTEXITCODE -ne 0) { throw "No se pudo generar $($s3Guion.id)" }
  [System.IO.File]::WriteAllText((Join-Path $s3Destino ($s3Guion.id + '.txt')), $s3Guion.historia + "`n", $OutputEncoding)
  Get-Item -LiteralPath $s3Salida | Select-Object Name,Length
}
