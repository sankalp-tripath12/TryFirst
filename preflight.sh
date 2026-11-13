cd ~/Major-Projects/01-Full-Stack/tryfirst || exit 1
git status --short
docker compose ps
curl -s http://localhost:4000/health; echo
