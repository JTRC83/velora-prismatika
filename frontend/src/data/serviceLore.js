export const SERVICE_LORE_ROTATION_MS = 18000;

const DEFAULT_LORE = {
  purpose: 'Cada servicio muestra un símbolo o patrón y lo relaciona con una pregunta concreta. La espera es un pequeño umbral para observar primero lo que ha aparecido antes de recibir la lectura.',
  items: [
    {
      kind: 'Lectura',
      title: 'Una pausa antes de la interpretación',
      body: 'Primero aparece el resultado y después se despliega su lectura: qué representa el símbolo, qué relación guarda con la consulta y qué preguntas puede abrir. No es una sentencia, sino una perspectiva para mirar el presente.'
    }
  ]
};

const SERVICE_LORE = {
  'Astrología Natal': {
    purpose: 'La carta natal usa fecha, hora y lugar para construir un mapa simbólico de signos, planetas, casas, aspectos y tránsitos. Sirve para reconocer patrones, tensiones y posibilidades, no para fijar un destino.',
    items: [
      {
        kind: 'Origen',
        title: 'Un mapa con más de dos milenios',
        body: 'Las raíces de la astrología occidental se sitúan en Mesopotamia, donde los cielos se leían sobre todo como señales colectivas. La carta natal individual aparece después, en el mundo helenístico, al combinar planetas, signos, casas y aspectos.'
      },
      {
        kind: 'Historia',
        title: 'Ptolomeo y el zodiaco tropical',
        body: 'En el Tetrabiblos, Ptolomeo intentó ordenar la astrología dentro de una filosofía natural y consolidó el zodiaco tropical, anclado al punto vernal. El signo representa así un sector simbólico del ciclo solar, no una constelación física literal.'
      },
      {
        kind: 'Función',
        title: 'Cálculo, símbolo y cuidado',
        body: 'Una lectura seria necesita cálculo fiable, interpretación clara y límites éticos. Conviene separar astronomía técnica y lectura simbólica: el resultado ayuda a observar ritmos internos, no a delegar decisiones importantes.'
      },
      {
        kind: 'Curiosidad',
        title: 'La hora cambia el ángulo del cielo',
        body: 'Dos personas nacidas el mismo día pueden recibir mapas muy distintos si cambian la hora o la ciudad. El ascendente, las casas y ciertos ángulos dependen de ese lugar concreto desde el que se mira el cielo.'
      }
    ]
  },
  Numerología: {
    purpose: 'La numerología relaciona nombre, fecha y año de consulta como un sistema simbólico de patrones. Su valor no está en predecir destino, sino en mostrar camino de vida, expresión, ciclo personal y tensiones de integración.',
    items: [
      {
        kind: 'Origen',
        title: 'Número como orden del mundo',
        body: 'Conviene distinguir el pitagorismo histórico de la numerología moderna. La tradición pitagórica entendía el número como armonía y estructura, pero los cálculos actuales de camino de vida, alma o personalidad se formalizan mucho más tarde.'
      },
      {
        kind: 'Historia',
        title: 'La forma moderna llega en el siglo XX',
        body: 'Mrs. L. Dow Balliett es una figura clave de la numerología occidental moderna. Esta corriente se entiende como una práctica simbólica de autoconocimiento, no como ciencia exacta ni como herencia literal de Pitágoras.'
      },
      {
        kind: 'Método',
        title: 'Cada escuela tiene su propio lenguaje',
        body: 'La numerología pitagórica moderna, el sistema caldeo, la gematría cabalística y el Lo Shu siguen lógicas distintas. Una lectura clara mantiene visible qué método emplea, en vez de mezclar sus cálculos como si fueran equivalentes.'
      },
      {
        kind: 'Clave',
        title: 'Los números maestros no son superioridad',
        body: 'Los números **11**, **22** y **33** suelen leerse como tensión, exigencia y responsabilidad. Un número maestro no eleva a nadie por encima de otros: señala una frecuencia que necesita práctica, humildad e integración.'
      }
    ]
  },
  'Fases Lunares': {
    purpose: 'Las fases lunares muestran luz, ciclo y ritmo para leer inicio, crecimiento, culminación, revisión o descanso. Funcionan como apoyo ritual suave, no como causa física de los acontecimientos personales.',
    items: [
      {
        kind: 'Origen',
        title: 'La Luna como primer reloj visible',
        body: 'La Luna fue uno de los marcadores temporales humanos más antiguos por su visibilidad, velocidad y relación con la noche. Su ciclo permitió organizar cosechas, mareas, descanso, ritual y memoria del tiempo.'
      },
      {
        kind: 'Ciclo',
        title: 'Ocho fases para una respiración completa',
        body: 'El ciclo sinódico dura unos 29,53 días y puede leerse en ocho fases: semilla, emergencia, decisión, ajuste, plenitud, diseminación, revisión y cierre. Cada una ofrece una imagen para observar el ritmo cotidiano.'
      },
      {
        kind: 'Símbolo',
        title: 'La Luna refleja, no brilla sola',
        body: 'La síntesis lunar se apoya en la idea soli-lunar: la Luna no tiene luz propia, refleja su relación con el Sol. Por eso la lectura no mira una bola aislada, sino la tensión entre propósito solar y asimilación emocional.'
      },
      {
        kind: 'Cuidado',
        title: 'La oscuridad no es negativa',
        body: 'La fase balsámica o de oscuridad se asocia con descanso, repliegue, duelo, digestión y preparación. No es un presagio oscuro, sino un símbolo de cierre fértil antes del siguiente inicio.'
      }
    ]
  },
  Compatibilidad: {
    purpose: 'La compatibilidad no juzga si una relación sirve o fracasa. Cartografía afinidades, fricciones, estilos de comunicación y ritmos afectivos para devolver agencia, conversación y cuidado a las personas implicadas.',
    items: [
      {
        kind: 'Principio',
        title: 'No es veredicto, es cartografía',
        body: 'En lugar de preguntar sólo “¿somos compatibles?”, conviene observar qué dinámicas se activan, qué necesita cuidado y cómo hablar con más conciencia. Ninguna lectura justifica control, celos, ruptura automática o dependencia.'
      },
      {
        kind: 'Método',
        title: 'Sinastría y carta compuesta',
        body: 'La sinastría compara dos mapas natales como “tú frente a mí”. La carta compuesta observa la relación como tercera entidad simbólica, útil para entender propósito común y clima emocional sin tratarlo como cielo físico literal.'
      },
      {
        kind: 'Historia',
        title: 'De temperamentos a vínculo psicológico',
        body: 'La compatibilidad clásica se relaciona con Ptolomeo y las cualidades de calor, frío, sequedad y humedad. La astrología humanista y la psicología simbólica desplazan el juicio hacia proyección, sombra y aprendizaje.'
      },
      {
        kind: 'Uso',
        title: 'El clima no cancela el viaje',
        body: 'Una combinación tensa no invalida un vínculo: señala dónde conviene llevar abrigo, hablar claro o cambiar el ritmo. Elementos, modalidades y signos se leen como un lenguaje de conversación, no como sentencia afectiva.'
      }
    ]
  },
  Rituales: {
    purpose: 'Los rituales preparan la atención, contienen la intensidad simbólica y traducen una lectura en gesto o reflexión. Ayudan a volver al presente con un significado propio.',
    items: [
      {
        kind: 'Origen',
        title: 'Separación, umbral y retorno',
        body: 'Arnold van Gennep describió una secuencia de separación, liminalidad y reincorporación. En un rito sencillo aparece como entrada tranquila, gesto central y cierre consciente para volver al presente con una orientación.'
      },
      {
        kind: 'Función',
        title: 'El ritual contiene el presente',
        body: 'Un ritual no promete controlar el futuro. Puede ser una secuencia breve de atención encarnada: respirar, tocar, escribir, pausar, cerrar e integrar lo que una lectura ha abierto.'
      },
      {
        kind: 'Cuidado',
        title: 'Breve, seguro y reversible',
        body: 'Los ritos más útiles son simples, de bajo riesgo y reversibles: sin fuego innecesario, sin sustancias, sin coerción y sin promesas de manifestación. Deben tener siempre un cierre claro.'
      },
      {
        kind: 'Curiosidad',
        title: 'Lo liminoide pertenece al mundo moderno',
        body: 'Victor Turner distingue lo liminal de lo liminoide: experiencias libres, estéticas e individuales. Los rituales personales pertenecen a este segundo registro, sin convertirse en obligación religiosa.'
      }
    ]
  },
  Chakras: {
    purpose: 'La lectura de chakras usa centros simbólicos, color, respiración y emoción como lenguaje de autopercepción. Es una síntesis moderna útil para ritual y bienestar reflexivo, nunca un diagnóstico médico o energético literal.',
    items: [
      {
        kind: 'Origen',
        title: 'Centros sutiles, no anatomía literal',
        body: 'Los chakras aparecen en tradiciones yóguicas, tántricas e hindu-budistas, donde el cuerpo sutil se recorre mediante nadis y prana. Se entienden como símbolos de práctica, no como órganos medibles.'
      },
      {
        kind: 'Historia',
        title: 'Del Tantra medieval a la síntesis moderna',
        body: 'El Tantra medieval trabajó modelos variados de centros, no un único sistema universal. La forma popular de siete chakras llega a Occidente mediante traducciones, teosofía, yoga moderno y adaptaciones psicológicas del siglo XX.'
      },
      {
        kind: 'Método',
        title: 'Centro, cualidad, sombra y ritual',
        body: 'Una lectura puede recorrer centro simbólico, cualidad psicológica, tensión entre luz y sombra, práctica suave y pregunta de diario. Es más útil hablar de focos de atención que de “bloqueos” cerrados.'
      },
      {
        kind: 'Cuidado',
        title: 'Los colores arcoíris son modernos',
        body: 'Los colores, cristales y asociaciones psicológicas son adaptaciones modernas. Pueden ser útiles para contemplación, pero no deben presentarse como doctrina tántrica antigua.'
      }
    ]
  },
  Tarot: {
    purpose: 'El tarot organiza pregunta, tirada, cartas, posiciones e imágenes como una práctica de reflexión. Cada posición da una función a la carta y permite explorar arquetipos, tensiones y caminos posibles, no certezas cerradas sobre el futuro.',
    items: [
      {
        kind: 'Origen',
        title: 'Nace como juego, no como profecía',
        body: 'El tarot nace en el norte de Italia entre los siglos XV y XVI como juego de bazas. Su lectura esotérica y cartomántica se desarrolla con fuerza en el siglo XVIII con Court de Gébelin y Etteilla.'
      },
      {
        kind: 'Escuela',
        title: 'Cada mazo habla una lengua distinta',
        body: 'Marsella, Rider-Waite-Smith, Thoth/Crowley y la lectura psicológica no ordenan los símbolos igual. Una lectura coherente respeta el lenguaje del mazo elegido y evita mezclar correspondencias contradictorias como si fueran una sola tabla.'
      },
      {
        kind: 'Historia',
        title: 'La Golden Dawn y los menores ilustrados',
        body: 'La Golden Dawn y el mazo Rider-Waite-Smith son claves para la lectura narrativa moderna. Las escenas de los arcanos menores permiten leer situaciones concretas, no sólo palos y números abstractos.'
      },
      {
        kind: 'Función',
        title: 'Cada posición cambia la carta',
        body: 'La misma carta no significa lo mismo como origen, presente, desafío, consejo o resultado. La posición marca su función dentro de la tirada; la orientación y la pregunta matizan ese sentido para formar un relato con contexto, no una equivalencia plana de diccionario.'
      }
    ]
  },
  Runas: {
    purpose: 'Las runas funcionan como oráculo breve y sobrio para cambio, bloqueo, protección, movimiento y decisión. El Elder Futhark de 24 runas ofrece un sistema base que distingue escritura antigua, magia talismánica y oráculo moderno.',
    items: [
      {
        kind: 'Origen',
        title: 'Primero escritura, después símbolo',
        body: 'Conviene distinguir primero historia y escritura, y después simbolismo moderno. Las runas nacen como sistemas alfabéticos germánicos entre la Antigüedad tardía y la Edad Media, no como una baraja contemporánea.'
      },
      {
        kind: 'Método',
        title: 'Elder Futhark como base cerrada',
        body: 'El Elder Futhark reúne 24 runas organizadas en tres aettir. La runa en blanco se excluye de este sistema porque es una invención moderna sin base epigráfica.'
      },
      {
        kind: 'Mito',
        title: 'Odín y las nueve noches',
        body: 'El Havamal cuenta que Odín obtiene las runas mediante autosacrificio en Yggdrasil durante nueve noches. Es un relato mítico de profundidad ritual, no una prueba histórica.'
      },
      {
        kind: 'Cuidado',
        title: 'Invertida no significa desgracia',
        body: 'Las inversiones o merkstave pueden leerse como energía internalizada, bloqueo temporal, proceso en gestación o sombra a integrar. Una runa invertida no equivale a amenaza ni fatalidad.'
      }
    ]
  },
  Cábala: {
    purpose: 'El Árbol de la Vida reúne correspondencias entre sefirot, senderos, letras, números, tarot y astrología. Esta lectura se inspira en la Cábala hermética occidental y no sustituye la enseñanza de la Cábala judía tradicional.',
    items: [
      {
        kind: 'Origen',
        title: 'Treinta y dos senderos de sabiduría',
        body: 'Una raíz temprana aparece en las corrientes Merkavah y Hejalot. El Sefer Yetzirah, entre los siglos II y VI d.C., vincula diez sefirot y veintidós letras con número, lenguaje y cosmos.'
      },
      {
        kind: 'Historia',
        title: 'Del Zohar a la Cábala hermética',
        body: 'El Zohar, difundido en Castilla en el siglo XIII, se vuelve obra central de la Cábala medieval. En el siglo XIX, Eliphas Levi y la Golden Dawn convierten el Árbol en un sistema occidental de correspondencias con tarot y astrología.'
      },
      {
        kind: 'Mapa',
        title: 'Diez esferas y tres pilares',
        body: 'El Árbol organiza diez sefirot, veintidós senderos, tres pilares y cuatro mundos. Puede leerse como cartografía de tensiones psicológicas y espirituales, no como una jerarquía que mida superioridad personal.'
      },
      {
        kind: 'Cuidado',
        title: 'Correspondencia no es prueba',
        body: 'Gematría, notaricon y temura pueden abrir asociaciones, pero no producen pruebas de destino. Conviene diferenciar Cábala judía, cristiana y hermética para evitar mezclas confusas.'
      }
    ]
  },
  Tránsitos: {
    purpose: 'Los tránsitos comparan el cielo actual o futuro con la carta natal fija. Se leen como clima simbólico de activación, tensión, maduración y oportunidad, nunca como alarma fatalista.',
    items: [
      {
        kind: 'Concepto',
        title: 'Las manecillas sobre el mapa natal',
        body: 'La carta natal puede imaginarse como una esfera fija; los tránsitos son manecillas que activan puntos concretos, las progresiones son maduración lenta y las fases lunares aportan un pulso cíclico corto.'
      },
      {
        kind: 'Historia',
        title: 'De presagios a procesos internos',
        body: 'En Mesopotamia los cielos se leían como señales colectivas. En la modernidad, autores como Dane Rudhyar, Liz Greene y Stephen Arroyo reformulan los tránsitos como procesos de reorganización psíquica, no amenazas inevitables.'
      },
      {
        kind: 'Técnica',
        title: 'Aspectos, orbes y estados',
        body: 'Un tránsito se lee por diferencia angular, aspecto, orbe, planeta y casa activada. También importa si el aspecto se acerca, está exacto o se separa, porque cada estado cambia el tono de la lectura.'
      },
      {
        kind: 'Cuidado',
        title: 'No todos los tránsitos pesan igual',
        body: 'La Luna puede describir horas; Saturno, Urano, Neptuno o Plutón suelen señalar procesos de meses o años. Un pulso rápido no tiene el mismo peso que una etapa estructural.'
      }
    ]
  },
  'Bola de Cristal': {
    purpose: 'La bola de cristal es una experiencia visual, proyectiva y narrativa. No predice: ofrece una superficie ambigua para observar símbolos, activar imaginación, formular preguntas y volver con una orientación concreta.',
    items: [
      {
        kind: 'Origen',
        title: 'Scrying: mirar una superficie quieta',
        body: 'El scrying es la contemplación de superficies reflectantes, oscuras, líquidas o translúcidas: agua, metales pulidos, espejos negros, obsidiana o cristal. Es una práctica cultural y simbólica, no una prueba de clarividencia.'
      },
      {
        kind: 'Historia',
        title: 'De cuencos oscuros a obsidiana',
        body: 'Hay antecedentes en Egipto, Grecia, Roma, tradiciones celtas, mundo mexica y la Inglaterra isabelina. El espejo de obsidiana atribuido a John Dee es una imagen poderosa del cruce entre ciencia, corte y magia renacentista.'
      },
      {
        kind: 'Función',
        title: 'La niebla abre asociación',
        body: 'La esfera favorece imaginación activa, pareidolia y narrativa autobiográfica. Una forma sugerida puede convertirse en pregunta, recuerdo, intuición o gesto de integración para el momento presente.'
      },
      {
        kind: 'Cuidado',
        title: 'Lo que aparece no cierra el futuro',
        body: 'Cada símbolo debe abrir una pregunta, ninguno cerrar el futuro. La lectura evita el miedo, las profecías y las respuestas absolutas de sí o no.'
      }
    ]
  },
  'Lectura de Mano': {
    purpose: 'La quiromancia observa líneas, montes, forma de la mano y mano dominante como lenguaje simbólico. No diagnostica salud, no fija el destino ni extrae rasgos biológicos reales.',
    items: [
      {
        kind: 'Origen',
        title: 'Mano y adivinación',
        body: 'Quiromancia une las ideas de mano y adivinación. Sus orígenes se sitúan en tradiciones védicas de la India y su expansión alcanza Asia, Persia y el Mediterráneo; algunas atribuciones antiguas pertenecen a la tradición legendaria, no a la certeza histórica.'
      },
      {
        kind: 'Historia',
        title: 'Quirognomia y quiromancia',
        body: 'En el siglo XIX, Casimir Stanislas D’Arpentigny separó la lectura de forma, dedos y textura de la lectura de líneas y montes. Esta distinción evita reducir toda la mano a una sola línea.'
      },
      {
        kind: 'Método',
        title: 'Dominante y no dominante',
        body: 'La mano no dominante suele leerse como base latente, herencia simbólica o potencial; la dominante como presente, voluntad practicada y adaptación. Compararlas abre una narrativa de maduración, no una sentencia.'
      },
      {
        kind: 'Cuidado',
        title: 'La línea de la vida no mide años',
        body: 'La línea de la vida no se vincula con longevidad. Se asocia simbólicamente con vitalidad, arraigo y modo de organizar energía, no con cuánto vivirá una persona ni con salud clínica.'
      }
    ]
  }
};

const SERVICE_ALIASES = {
  'Tarot 3 Cartas': 'Tarot',
  'Tarot 5 Cartas': 'Tarot',
  'Tarot 1 Carta': 'Tarot',
  'Consejo del Día': 'Tarot',
  'Pasado, Presente, Futuro': 'Tarot',
  'Pasado, Presente y Futuro': 'Tarot',
  'La Estrella de la Verdad': 'Tarot',
  'Afinidad de Signos': 'Compatibilidad'
};

export function getServiceLore(serviceName) {
  if (typeof serviceName === 'string' && serviceName.toLowerCase().includes('tarot')) {
    return SERVICE_LORE.Tarot;
  }

  const key = SERVICE_ALIASES[serviceName] || serviceName;
  return SERVICE_LORE[key] || DEFAULT_LORE;
}
