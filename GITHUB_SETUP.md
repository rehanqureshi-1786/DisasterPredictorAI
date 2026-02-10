# How to Upload to GitHub

Follow these steps to put your project on your GitHub profile safely.

### 1. ⚙️ Initialize Git
Open your terminal in the `DISASTERPREDICT` folder and run:
```bash
git init
```

### 2. 📝 Add and Commit Files
Add all your files to the staging area. The `.gitignore` I created will automatically skip your secrets (`.env`) and database.
```bash
git add .
git commit -m "Initial commit: AI Disaster Predictor Dashboard"
```

### 3. 🌐 Create a Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Name it `DisasterPredictAI`.
3. Keep it **Public** (so your internship recruiters can see it).
4. **DO NOT** initialize with a README, license, or gitignore (we already have them!).
5. Click **Create repository**.

### 4. 🔗 Connect and Push
Copy the commands from the GitHub "quick setup" page (replace `USERNAME` with your actual name):
```bash
git remote add origin https://github.com/USERNAME/DisasterPredictorAI.git
git branch -M main
git push -u origin main
```

### 5. ✨ Check your profile
Refresh your browser on GitHub! You should see your beautiful code, the `README.md` explaining the project, and the `SECURITY_GUIDE.md` keeping you safe.
