# GitHub Pages 公開スクリプト（要: gh auth login 済み）
$ErrorActionPreference = "Stop"
$repo = "koga-kensetsu-hp"

gh auth status
if ($LASTEXITCODE -ne 0) { Write-Host "先に gh auth login を実行してください" -ForegroundColor Red; exit 1 }

$owner = gh api user --jq .login

# リポジトリ作成（既存ならスキップ）& push
gh repo view "$owner/$repo" 2>$null
if ($LASTEXITCODE -ne 0) {
    gh repo create $repo --public --source . --push
} else {
    git push -u origin main
}

# GitHub Pages 有効化（main ブランチ / ルート）
$ErrorActionPreference = "Continue"
'{"source":{"branch":"main","path":"/"}}' | gh api "repos/$owner/$repo/pages" -X POST --input -
if ($LASTEXITCODE -ne 0) { Write-Host "(Pagesは既に有効化済みの可能性があります)" }

Write-Host ""
Write-Host "公開URL: https://$owner.github.io/$repo/" -ForegroundColor Green
Write-Host "反映まで1〜2分かかることがあります。"
