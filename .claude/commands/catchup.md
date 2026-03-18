Restaura contexto después de /clear o al inicio de sesión.

Pasos:
0. Ejecuta compliance check: `bash /mnt/d/01_PROYECTOS_ACTIVOS/NEXUS_DOTFILES/scripts/protocol-compliance-check.sh .`
   - Si falta algo, avisa al usuario ANTES de continuar (pero no bloquees el catchup)
1. Lee CLAUDE.md del proyecto
2. Lee PROJECT_STATE.json
3. Lee docs/PRD.md (si existe)
4. Lee docs/PROGRESS.md (si existe) — última entrada
5. Lee tasks/lessons.md (si existe) — errores a evitar
6. Lista archivos cambiados en branch actual vs main: `git diff --name-only main...HEAD`
7. Si no hay branch, lista cambios recientes: `git log --oneline -10`
8. Lee el último handoff en /mnt/d/NEXUS_COMMS/handoffs/ relevante al proyecto

Resume en formato:
- **Fase actual:** [fase del PRD]
- **Último trabajo:** [qué se hizo]
- **Archivos modificados:** [lista]
- **Errores a evitar:** [de lessons.md]
- **Próximo paso:** [de PROGRESS.md]
- **Bloqueadores:** [si hay]
