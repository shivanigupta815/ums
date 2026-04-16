@echo off
rem Compile with Java 17 target to match older runtimes (class version 65)
set "JDKPATH=C:\Program Files\Java\jdk-25.0.2\bin"
if exist "%JDKPATH%\javac.exe" (
    echo Using JDK from %JDKPATH%
    set "JAVAC=%JDKPATH%\javac.exe"
    set "JAVA=%JDKPATH%\java.exe"
) else (
    echo JDK 25 not found; trying system PATH java/javac
    set "JAVAC=javac"
    set "JAVA=java"
)

echo Building University Management System...
"%JAVAC%" --release 17 -cp "lib/Jar/mysql-connector-java-8.0.28.jar;lib/Jar/jcalendar-tz-1.3.3-4.jar;lib/Jar/rs2xml.jar" -d bin "src\university\management\system\*.java"
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Build successful!
echo.
echo Running University Management System...
"%JAVA%" -cp "bin;lib/Jar/mysql-connector-java-8.0.28.jar;lib/Jar/jcalendar-tz-1.3.3-4.jar;lib/Jar/rs2xml.jar" university.management.system.Splash