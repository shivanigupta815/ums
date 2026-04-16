## Getting Started

Welcome to the VS Code Java world. Here is a guideline to help you get started to write Java code in Visual Studio Code.

## Folder Structure

The workspace contains two folders by default, where:

- `src`: the folder to maintain sources
- `lib`: the folder to maintain dependencies

Meanwhile, the compiled output files will be generated in the `bin` folder by default.

> If you want to customize the folder structure, open `.vscode/settings.json` and update the related settings there.

## Dependency Management

The `JAVA PROJECTS` view allows you to manage your dependencies. More details can be found [here](https://github.com/microsoft/vscode-java-dependency#manage-dependencies).

## Compile and Run (Windows)

1. Open a terminal in the workspace root.
2. Run: `mvn compile` (if using Maven) or via VS Code tasks below.
3. For this project, we use these jars in `lib/Jar`:
   - `mysql-connector-java-8.0.28.jar`
   - `jcalendar-tz-1.3.3-4.jar`
   - `rs2xml.jar`
4. CLI compile command (for quick testing):
   ```powershell
   Get-ChildItem -Recurse -Filter *.java -Path src | ForEach-Object { $_.FullName } > src-files.txt
   javac -cp "lib/Jar/mysql-connector-java-8.0.28.jar;lib/Jar/jcalendar-tz-1.3.3-4.jar;lib/Jar/rs2xml.jar" -d bin @src-files.txt
   java -cp "bin;lib/Jar/mysql-connector-java-8.0.28.jar;lib/Jar/jcalendar-tz-1.3.3-4.jar;lib/Jar/rs2xml.jar" university.management.system.Splash
   ```

5. In VS Code, run the default task `Build Java Project`, then use launch config `Launch Splash`.

## Web UI (Bootstrap/jQuery) Conversion

The project now includes a web UI-based version in the `web/` folder.

- `web/index.html`: splash + login
- `web/dashboard.html`: main dashboard with navigation bar
- `web/add-student.html`, `web/add-teacher.html`: forms for record insertion
- `web/student-details.html`, `web/teacher-details.html`: detail tables
- `web/fee-structure.html`, `web/exam-details.html`: additional screens
- `web/style.css`, `web/script.js`: styles and behavior

### Run Web UI

1. Open `web/index.html` in browser directly, or run local server:

   ```powershell
   cd "c:\Users\shiva\Downloads\University-Management-System-master\University-Management-System-master\University Management System\web"
   python -m http.server 8000
   ```

2. Navigate to `http://localhost:8000`.
3. Login using `admin/admin`.

> This is a UI port of the desktop Swing app and uses `localStorage` for data persistence; implement a real backend as needed.

