# PokeDoom

PokeDoom es una aplicación web mobile-first para explorar Pokémon mediante [PokéAPI](https://pokeapi.co/). Permite buscar y filtrar Pokémon, consultar información detallada, guardar favoritos personalizados y mantener un historial local de visitas.

Proyecto desarrollado para el Trabajo Integrador del Módulo 1 de Aplicaciones Móviles.

## Funcionalidades

- Pokédex paginada con 10 Pokémon por página.
- Búsqueda por nombre y filtros por tipo y región.
- Contador de resultados y etiquetas de filtros aplicados.
- Vista detallada con descripción, tipos, habilidades, estadísticas, géneros y variantes shiny.
- Debilidades, resistencias, inmunidades y cadenas evolutivas.
- Formas Mega, Primal y Gigantamax cuando están disponibles.
- Favoritos con prioridad, etiqueta personalizada y nota personal.
- Búsqueda, filtros y paginación de favoritos.
- Historial automático limitado a los 100 Pokémon más recientes.
- Persistencia de favoritos, historial y tema mediante `localStorage`.
- Tema claro y oscuro.
- Página de contacto con validaciones y mapa de la Catedral de La Plata.
- Navegación accesible, estados de carga y manejo de errores.
- Diseño responsive con CSS propio y enfoque mobile-first.

## Tecnologías

- React
- JavaScript
- CSS
- Fetch API
- PokéAPI
- OpenStreetMap
- localStorage

No se utilizan frameworks ni librerías de interfaz visual.

## Instalación

Es necesario tener instalados Node.js y npm.

```bash
git clone https://github.com/brunossaid/pokedoom.git
cd pokedoom
npm install
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir la aplicación en el navegador.

## Comandos disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Genera la versión de producción
npm run preview  # Previsualiza la versión de producción
npm run lint     # Revisa el código con ESLint
```

## Rutas

| Ruta | Vista |
| --- | --- |
| `/` | Inicio |
| `/pokedex` | Búsqueda y listado de Pokémon |
| `/pokemon/:name` | Detalle de un Pokémon |
| `/favorites` | Pokémon favoritos |
| `/history` | Historial de visitas |
| `/contact` | Contacto y ubicación |

Las rutas inexistentes muestran una página 404 propia.

## Autores

- Agustín Cabeda — [cabeda52@gmail.com](mailto:cabeda52@gmail.com)
- Bruno Said — [ibrunosaid@gmail.com](mailto:ibrunosaid@gmail.com)

## Fuentes de datos y mapas

- Datos de Pokémon: [PokéAPI](https://pokeapi.co/)
- Mapa: [OpenStreetMap](https://www.openstreetmap.org/)
