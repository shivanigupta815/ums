@echo off
setlocal enabledelayedexpansion

rem 1) detect java home with high confidence
set "CANDIDATES=\"C:\Program Files\Java\jdk-25.0.2\bin\javac.exe\" \"C:\Program Files\Java\jdk-21.0.1\bin\javac.exe\" \"C:\Program Files\Java\jdk-17.0.10\bin\javac.exe\""
set "JAVA_HOME="
for %%J in (%CANDIDATES%) do (
    if exist %%~J (
        set "JAVA_HOME=%%~dpJ"
        goto :FOUND_JDK
    )
)

for /d %%D in ("C:\Program Files\Java\jdk*") do (
    if exist "%%D\bin\javac.exe" (
        set "JAVA_HOME=%%D\bin"
        goto :FOUND_JDK
    )
)

:FOUND_JDK
if "%JAVA_HOME%" == "" (
    echo ERROR: No JDK found. Install JDK 17 or JDK 25 and update run-fix.bat.
    pause
    exit /b 1
)

echo Using JDK bin: %JAVA_HOME%
%JAVA_HOME%\javac.exe --version
%JAVA_HOME%\java.exe -version

rem 2) clean previous classes
if exist bin\* rmdir /s /q bin
mkdir bin

rem 3) compile with release 17 for max compatibility
"%JAVA_HOME%\javac.exe" --release 17 -cp "lib/Jar/mysql-connector-java-8.0.28.jar;lib/Jar/jcalendar-tz-1.3.3-4.jar;lib/Jar/rs2xml.jar" -d bin src\university\management\system\*.java
if errorlevel 1 (
    echo Compilation failed.
    pause
    exit /b 1
)

rem 4) run app
"%JAVA_HOME%\java.exe" -cp "bin;lib/Jar/mysql-connector-java-8.0.28.jar;lib/Jar/jcalendar-tz-1.3.3-4.jar;lib/Jar/rs2xml.jar" university.management.system.Splash

endlocal
