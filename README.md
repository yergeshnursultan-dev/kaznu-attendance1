# KazNU Smart Attendance AI

Бет танудың негізіндегі автоматты қатысу жүйесі (KazNU).

## Қажетті бағдарламалар

Орнатудан бұрын жүктеп алыңыз:

| Бағдарлама | Сілтеме | Нұсқа |
|---|---|---|
| Python | https://www.python.org/downloads/ | 3.10+ |
| Node.js | https://nodejs.org | LTS |

> Python орнатқанда **"Add Python to PATH"** белгісін міндетті қойыңыз!

## Орнату (бір рет)

### Windows
1. Кодты жүктеп алыңыз (Download ZIP) немесе `git clone`
2. **`INSTALL.bat`** файлын екі рет басыңыз
3. Барлығы автоматты орнатылады (~3-5 минут)

### Mac
1. Кодты жүктеп алыңыз (Download ZIP) немесе `git clone`
2. Терминалды ашыңыз, жоба папкасына өтіңіз
3. Рұқсат беріңіз және орнатыңыз:
   ```bash
   chmod +x install.sh start.sh
   ./install.sh
   ```

## Іске қосу

### Windows
**`START.bat`** файлын екі рет басыңыз → браузер автоматты ашылады.

### Mac
```bash
./start.sh
```
Браузер автоматты ашылады.

Логин: `bekova` / Кулпысөз: `12345`

## Студент суреттерін тіркеу

1. `backend/faces/` папкасына суреттер салыңыз:
   - `STU001.jpg`, `STU002.jpg`, ...
2. **`СУРЕТТЕР_ТІРКЕУ.bat`** іске қосыңыз

## Технологиялар

- **Backend**: Python, FastAPI, SQLite, OpenCV (YuNet + SFace)
- **Frontend**: React, Vite, Tailwind CSS
- **AI**: YuNet face detection + SFace face recognition
