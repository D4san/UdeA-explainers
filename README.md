# UdeA explainers

Repositorio de explicaciones interactivas para cursos y talleres.

La guía de trabajo del repositorio está en [`AGENTS.md`](AGENTS.md). Ahí se fija el estándar pedagógico, la estructura de carpetas y la lista de verificación antes de publicar.

## Explicaciones disponibles

### Mecánica Celeste

- [Funcionales, accion y Euler-Lagrange](meccel/funcionales-euler-lagrange/index.html)

### Mecánica de Medios Continuos

- [Funcion de corriente alrededor de un cilindro](mcon/funcion-corriente-cilindro/index.html)
- [Solucion computacional de solidos elasticos](mcon/solidos-elasticos-computacional/index.html)

## Estructura sugerida

```text
curso-o-area/
  tema-del-explainer/
    index.html
    styles.css
    script.js
```

La idea es mantener cada explicación como un sitio estático autocontenido, facil de publicar en GitHub Pages o Netlify.

## Publicación

GitHub Pages publica desde la rama `main` y la carpeta raíz `/`.

Sitio público:

<https://d4san.github.io/UdeA-explainers/>
