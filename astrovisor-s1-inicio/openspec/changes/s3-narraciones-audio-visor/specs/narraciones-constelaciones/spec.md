# Narraciones de constelaciones

## Purpose

Permitir que visitantes, prioritariamente personas adultas mayores, escuchen narraciones de constelaciones a su ritmo en fichas 3D y web, con lectura equivalente y procedencia documentada.

## ADDED Requirements

### Requirement: Tres narraciones reales y trazables

El sistema SHALL disponer de un archivo de voz real para Orión, Osa Mayor y Escorpio, basado en su guion original confirmado, con transcripción fiel y autoría, procedencia y permiso identificados para texto y voz. El contenido provisional o sintético SHALL estar rotulado y no SHALL presentarse como material aprobado por la biblioteca.

#### Scenario: Revisión de un recurso
- **WHEN** se revisa cada una de las tres narraciones de la demostración
- **THEN** su archivo se reproduce con voz inteligible, corresponde al guion identificado y permite consultar la transcripción y los créditos.
- **AND** un pitido, archivo vacío o síntesis en vivo sin archivo no satisface la entrega.

#### Scenario: Procedencia pendiente
- **WHEN** no se ha confirmado el permiso de un texto o voz
- **THEN** ese material no se presenta como narración autorizada y su validación queda pendiente.

### Requirement: Fichas y controles dentro del visor

La experiencia 3D SHALL permitir abrir fichas de las tres constelaciones y activar Escuchar, Pausar, Reanudar y Cerrar mediante mirada. SHALL ofrecer también controles equivalentes por tacto y teclado, sin requerir cuenta de visitante.

#### Scenario: Selección en vista dividida
- **WHEN** el visitante abre una constelación y mantiene la mirada sobre una acción disponible durante el tiempo de selección indicado
- **THEN** se ejecuta una sola acción y se muestra su resultado en la ficha visible en ambos ojos.
- **AND** una acción oculta o deshabilitada no intercepta la selección.

#### Scenario: Operación sin visor
- **WHEN** el visitante utiliza la ficha web con teclado o tacto
- **THEN** puede leer y controlar su narración sin sensores ni dispositivo Homido.

### Requirement: Reproducción al ritmo del visitante

El sistema SHALL iniciar la narración al solicitar Escuchar, conservar la posición al Pausar y continuar desde esa posición al Reanudar. SHALL permitir repetir desde el inicio al finalizar e informar los estados de carga, reproducción, pausa, finalización y fallo sin depender solo de color o sonido.

#### Scenario: Pausa y continuación
- **WHEN** el visitante pausa una narración que ha avanzado y posteriormente solicita Reanudar
- **THEN** el sonido se interrumpe durante la pausa y continúa desde la posición conservada.

#### Scenario: Fin de la narración
- **WHEN** termina el archivo
- **THEN** la ficha muestra que finalizó y permite Escuchar de nuevo desde el inicio.

### Requirement: Detención y exclusión de narraciones simultáneas

El sistema SHALL mantener como máximo una narración activa. SHALL detenerla y reiniciar su posición al cerrar la ficha, cambiar constelación o salir del visor, incluyendo regreso a 2D, navegación y salida de la página. Una solicitud de reproducción pendiente no SHALL reactivarla después de esas salidas.

#### Scenario: Cerrar una ficha con audio
- **WHEN** se cierra la ficha mientras reproduce o está cargando
- **THEN** no queda sonido de esa ficha y al reabrirla Escuchar comienza desde el inicio.

#### Scenario: Cambiar de constelación
- **WHEN** se abre otra constelación mientras la anterior reproduce o está en pausa
- **THEN** se descarta la posición anterior y no se superponen las narraciones.

#### Scenario: Salir del visor
- **WHEN** se abandona la vista dividida o la página del visor mientras hay una narración activa
- **THEN** el sonido se detiene y no se reanuda automáticamente al regresar.

### Requirement: Activación móvil mediante gesto previo

El sistema SHALL ofrecer Activar audio mediante un gesto explícito antes del uso por mirada. SHALL informar si un intento de reproducción fue bloqueado y permitir reintentarlo con gesto explícito, conservando la lectura. La confirmación de activación no SHALL sustituir la prueba de reproducción posterior en el navegador real.

#### Scenario: Reproducción por mirada bloqueada
- **WHEN** el navegador rechaza Escuchar o Reanudar por falta de activación
- **THEN** se informa que debe tocar Activar audio o un control de reproducción y no se muestra el estado Reproduciendo.
- **AND** la historia sigue legible y se puede volver a intentar.

#### Scenario: Gesto y selección posterior
- **WHEN** el visitante toca Activar audio y luego selecciona Escuchar por mirada en el teléfono de prueba
- **THEN** se registra el resultado real de la reproducción y cualquier limitación, sin asumir que la activación funcionó en otros navegadores.

### Requirement: Lectura accesible y degradación por fallo de audio

La ficha SHALL conservar historia y transcripción legibles cuando falta el audio, falla su descarga o su formato no se puede reproducir. Los controles web SHALL tener nombres claros, foco visible y tamaño táctil mínimo de 48 px, y permitir lectura a 360 px y texto al 200 % sin recortes.

#### Scenario: Recurso ausente o incompatible
- **WHEN** la historia está disponible pero el audio no existe o falla
- **THEN** se muestra un mensaje de audio no disponible, se conserva la lectura y se ofrece reintento cuando corresponde.
- **AND** el fallo multimedia no invalida toda la colección de historias.

#### Scenario: Legibilidad en web
- **WHEN** se revisa la ficha con teclado, a 360 px de ancho y con texto al 200 %
- **THEN** los textos y controles se mantienen legibles y operables sin superposición.

### Requirement: Evidencia y revisión cruzada para cierre de S3

La entrega SHALL identificar versión, fecha real, dispositivo/navegador y resultados de escucha de los tres audios, controles y detenciones. SHALL incluir prueba física en iPhone Safari y/o Android Chrome y revisión por otro integrante. S3 SHALL permanecer pendiente mientras falte verificar audio real o cualquiera de las evidencias requeridas.

#### Scenario: Prueba móvil y Homido
- **WHEN** se ejecuta la revisión del 3 de noviembre en teléfono y visor
- **THEN** se documentan activación previa, selección por mirada, pausa/reanudación, cierre, cambio y salida, con resultados y limitaciones observados.
- **AND** una emulación de viewport no se registra como prueba física.

#### Scenario: Revisión por otro integrante
- **WHEN** otro integrante revisa la versión y los materiales
- **THEN** se registra su identidad, alcance, resultado y evidencia o fuente del reporte, sin atribuir una aprobación no recibida.

#### Scenario: Evidencia incompleta
- **WHEN** solo se han implementado controles o superado pruebas simuladas
- **THEN** el seguimiento distingue implementación, simulación y verificación pendiente, y no marca S3 como terminado.
