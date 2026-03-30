$env:NODE_ENV="development"
npx tsx server/index.ts 2>&1 | Out-File frontend_err2.txt -Encoding utf8
