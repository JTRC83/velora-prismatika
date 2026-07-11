# Continuidad de desarrollo

Ultima actualizacion: 2026-06-14

Este documento recoge los puntos pendientes para retomar el trabajo de Velora
Prismatika en la siguiente sesion sin depender del historial del chat.

## Prioridades proximas

### Espera de Velora y cards informativas

- Revisar los tiempos de rotacion de curiosidades, origenes e historia de cada servicio para que el usuario pueda leerlos con calma.
- Hacer mas extensas y utiles las explicaciones que se muestran durante la espera.
- Mantener la espera como una experiencia informativa: origen, historia, personajes, curiosidades y finalidad del servicio.

### Filigranas y presencia visual

- Mejorar las filigranas de las cards de Velora. Ya se han pulido, pero todavia se ven mejorables.
- Revisar que ningun texto, marco o card secundaria toque o pise las filigranas.
- Dar mas presencia ornamental sin romper legibilidad.

### Fase lunar

- Revisar la ilustracion central de la fase actual para que sea mas fiel a la realidad astronomica.
- En menguante, la parte iluminada debe leerse claramente como forma de C, siguiendo las imagenes de referencia.
- Aumentar el texto bajo la ilustracion, ahora se ve demasiado pequeno.
- Hacer que la animacion de la ilustracion se perciba un poco mas; actualmente es demasiado leve.

### Datos persistentes del usuario

- Implementar un sistema para guardar nombre y fecha de nacimiento cuando el usuario los introduce por primera vez.
- Reutilizar esos datos por defecto en servicios que los necesiten, como carta natal, numerologia y otros.
- Permitir que el usuario los cambie si quiere, pero evitar que tenga que introducirlos 3 o 4 veces seguidas.

### Bola de cristal

- Seguir mejorando la peana de la bola de cristal, especialmente volumen, union entre capas y acabado visual.
- Revisar que no sobresalgan elementos laterales o capas mal conectadas.
- Mantener la bola bien asentada sobre la peana.

### Arranque de la aplicacion

- Revisar el comando de arranque completo de Velora.
- Terminar el flujo con logo/icono para poder poner la aplicacion en el Dock.
- Asegurar que el arranque levanta frontend, backend, Ollama y modelo local sin pasos manuales.

### Card final de informe del usuario

- Disenar una card final con la informacion consultada por el usuario.
- Debe recopilar datos relevantes de servicios que puedan afectarle directamente, como horoscopo, numerologia y tarot.
- No todos los servicios tienen que entrar en el informe.
- Explorar una card tipo tarot: una cara como reverso de carta y otra cara con resumen/informe.
- Definir que datos se guardan, como se resumen y cuando se muestra esta card final.

### Voz de Velora

- Implementar voz para Velora como fase final.
- Investigar/integrar Voicebox para generar o servir la voz de Velora.
- Decidir como se conectara la respuesta escrita actual con una salida hablada.

## Nota de continuidad

La proxima sesion deberia retomar esta lista como fuente de verdad para elegir
la siguiente tarea, priorizando primero los detalles visibles de experiencia y
despues las capas de persistencia, informe final y voz.
