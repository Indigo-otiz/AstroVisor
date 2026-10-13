# Cómo iniciar la demo AstroVisor con Codex

Este paquete **no contiene código de la aplicación**. Contiene el contexto y los prompts para que Codex genere el primer incremento dentro de tu proyecto.

1. Instala Node.js compatible con Vite y Git. Se recomienda Node 22 LTS o una versión moderna compatible.
2. Crea una carpeta nueva llamada `astrovisor-demo` y copia dentro los cinco archivos Markdown de este paquete.
3. Abre esa carpeta en Codex (extensión de VS Code o aplicación) y pega el contenido de `PROMPT_01_CODEX.md`.
4. Si prefieres CLI, instala Codex con `npm install -g @openai/codex@latest`, abre terminal en la carpeta y ejecuta `codex`. Inicia sesión siguiendo las indicaciones.
5. Revisa los cambios propuestos antes de aceptarlos y permite a Codex instalar dependencias si tu entorno lo autoriza.
6. Pide que ejecute build y pruebas; después inicia la app con los comandos que genere en su README.
7. No pases a `PROMPT_02_OPCIONAL.md` hasta que el flujo web → API → 3D funcione en tu computadora.

## Fuentes de consulta
- Codex: https://developers.openai.com/learn/codex
- Vite: https://vite.dev/guide/
- Three.js: https://threejs.org/manual/pages/installation.html
