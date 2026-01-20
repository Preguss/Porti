@echo off
cd "c:\Users\pregu\OneDrive\Documentos\Portifolio_final"
echo Iniciando auto-push >> debug_log.txt
git add . >> debug_log.txt 2>&1
git status >> debug_log.txt 2>&1
git diff --quiet --exit-code
if %errorlevel% neq 0 (
    git commit -m "Auto-commit %date% %time%" >> debug_log.txt 2>&1
    git push origin master >> debug_log.txt 2>&1
) else (
    echo Nenhuma mudanca detectada >> debug_log.txt
)
echo Auto-push concluido em %date% %time% >> debug_log.txt