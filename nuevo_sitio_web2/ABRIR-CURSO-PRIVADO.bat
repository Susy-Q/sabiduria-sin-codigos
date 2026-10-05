@echo off
title Sabiduria Sin Codigos - Curso privado
cd /d "%~dp0"
set "NODE_EXE="
for /r "%LOCALAPPDATA%\OpenAI\Codex\runtimes\cua_node" %%F in (node.exe) do set "NODE_EXE=%%F"
if not defined NODE_EXE (
  echo No se encontro el entorno local necesario.
  pause
  exit /b 1
)
"%NODE_EXE%" --no-warnings "%~dp0iniciar-curso.js"
