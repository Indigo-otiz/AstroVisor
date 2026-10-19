# OpenSpec en AstroVisor

## Instalación en la computadora del equipo
Requiere Node.js 20.19 o superior. En una terminal:

```bash
npm install -g @fission-ai/openspec@latest
cd astrovisor-s1-inicio
openspec init
```

Seleccionar las integraciones que realmente utiliza el equipo (por ejemplo Claude Code y Codex). Revisar que `openspec/config.yaml` conserve su contexto; iniciar una sesión nueva en el asistente si los comandos no aparecen.

## Primera propuesta (ya incluida como borrador revisable)

`openspec/changes/bootstrap-astrovisor-s1/`

Contiene propuesta, decisiones, especificaciones de comportamiento y checklist. Es un borrador para que el equipo lo compare con el código y lo ajuste antes de incorporarlo formalmente a su repo.

```bash
openspec list
openspec validate bootstrap-astrovisor-s1 --strict
```

OpenSpec se emplea con un asistente de programación, no como un shell interactivo:
- En Claude Code: `/opsx:propose`, `/opsx:apply`, `/opsx:archive`.
- En Codex: se muestran como skills, normalmente `$openspec-propose`, `$openspec-apply-change` (ver salida de init).

Para cambios siguientes: proponer, revisar artefactos, aplicar, verificar y archivar solo cuando corresponda. Cada propuesta es un incremento técnico, no cada archivo.

Fuentes:
- https://openspec.dev/docs/installation
- https://openspec.dev/docs/setup
- https://openspec.dev/docs/configuration/config-yaml
