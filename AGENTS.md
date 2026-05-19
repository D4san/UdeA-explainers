# AGENTS.md

Este repositorio contiene explicaciones interactivas para cursos de la UdeA. Tratarlo como una biblioteca docente publicable, no como una colección de demos sueltas.

## Objetivo del repo

Crear explainers web autocontenidos, pedagógicos y reutilizables para clases, talleres y material de estudio. El estilo deseado es cercano a Distill: texto claro, derivaciones cuidadosas, figuras útiles e interacciones que enseñen una idea concreta.

## Estructura

Cada explicación debe vivir en su propia carpeta:

```text
curso-o-area/
  tema-del-explainer/
    index.html
    styles.css
    script.js
```

La página raíz `index.html` funciona como índice público de cursos y explicaciones.

## Cursos y nombres visibles

Usar nombres de curso completos en la portada pública, no solo siglas internas.

- `meccel/` se muestra como **Mecánica Celeste**.
- Para material de mecánica de medios continuos, crear una carpeta como `medios-continuos/` y mostrarla como **Mecánica de Medios Continuos**.

No cambiar rutas publicadas si ya existen enlaces compartidos; preferir cambiar nombres visibles en el índice.

## Estándar pedagógico

Cada explainer debe tener, salvo que el tema pida otra cosa:

1. Una intuición inicial que cambie la forma de mirar el problema.
2. Desarrollo matemático paso a paso, con pasos intermedios suficientes.
3. Un ejemplo trabajado antes de pasar a abstracciones mayores.
4. Al menos una figura o interacción que sea necesaria para entender, no decorativa.
5. Una sección de interpretación: qué significa el resultado y qué no significa.
6. Preguntas de salida o chequeos conceptuales.

Para física y matemáticas, priorizar una derivación masticada sobre una visual bonita pero superficial.

## Patrón para derivaciones

Cuando haya una deducción:

- Nombrar el objeto que se está variando o extremando.
- Separar candidato, perturbación, parámetro pequeño y condiciones de borde.
- Mostrar la regla de la cadena o paso algebraico que introduce cada término.
- Explicar por qué se puede eliminar o transformar un término.
- Indicar dónde entra una hipótesis física o geométrica.
- Cerrar con la lectura conceptual del resultado.

Ejemplo de criterio: en Euler-Lagrange no basta con mostrar la ecuación final; deben aparecer la familia variada, la derivada respecto a epsilon, integración por partes, extremos fijos y arbitrariedad de la variación.

## Interacciones

Una interacción debe responder una pregunta del estudiante, por ejemplo:

- ¿Qué cambia si muevo este parámetro?
- ¿Qué término del lagrangiano produce esta ecuación?
- ¿Qué cantidad se conserva y por qué?
- ¿Qué representación hace visible una simplificación?

Evitar controles que solo animen algo sin explicar una idea.

## Lagrangianos y mecánica

Cuando se trabaje con sistemas lagrangianos, organizar la explicación así:

1. Coordenadas escogidas y restricciones.
2. Energía cinética.
3. Energía potencial.
4. Lagrangiano.
5. Ecuaciones de Euler-Lagrange.
6. Simetrías visibles en el lagrangiano.
7. Cantidades conservadas.
8. Interpretación o cambio de variables útil.

No saltar directamente a la solución temporal si el objetivo docente es leer la estructura del lagrangiano.

## Publicación

Antes de cerrar un cambio:

- Abrir o validar la página localmente.
- Revisar escritorio y móvil.
- Verificar MathJax o ecuaciones renderizadas.
- Probar sliders, botones y pasos.
- Confirmar que no hay overflow horizontal.
- Actualizar el índice raíz si se agrega una nueva explicación.
- Hacer commit y push si el usuario pidió publicar.

GitHub Pages publica desde `main` y `/`.

## Estilo visual

Mantener un estilo sobrio, claro y académico:

- Tipografía legible.
- Secciones amplias, sin landing page decorativa.
- Tarjetas solo para bloques concretos, no para envolver cada sección.
- Figuras SVG o canvas con etiquetas claras.
- Evitar adornos que no ayuden a estudiar.

## Relación con notas fuente

Cuando una explicación venga de notas del vault DASAN:

- Leer primero la nota madre y las notas de problemas relacionadas.
- Conservar la narrativa pedagógica del usuario.
- Integrar anotaciones manuscritas como preguntas, advertencias y pasos intermedios.
- No convertir un taller completo en una demo mínima; la web debe enseñar.
