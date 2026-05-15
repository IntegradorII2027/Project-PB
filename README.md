# RestaurantOS — Sistema de Gestión de Restaurantes

SaaS de gestión interna para restaurantes: pedidos, mesas, cocina, inventario, reportes y caja.

## Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Query + Zustand
- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Auth**: JWT (access 15min) + Refresh Token (7d, httpOnly cookie)

---

## Requisitos previos
- Node.js 18+
- PostgreSQL 14+ corriendo en localhost:5432

---

## Configuración inicial

### 1. Base de datos
Crear la base de datos en PostgreSQL:
```sql
CREATE DATABASE restaurantos;
```

### 2. Backend

```bash
cd restaurantos/backend

# Editar .env con tu conexión PostgreSQL
# DATABASE_URL="postgresql://TU_USUARIO:TU_PASS@localhost:5432/restaurantos"

npm install

# Crear tablas
npx prisma migrate dev --name init

# Cargar datos de prueba
npm run db:seed
```

### 3. Frontend

```bash
cd restaurantos/frontend
npm install
```

---

## Levantar el proyecto

**Backend** (puerto 3001):
```bash
cd restaurantos/backend
npm run dev
```

**Frontend** (puerto 5173):
```bash
cd restaurantos/frontend
npm run dev
```

Abrir: http://localhost:5173

---

## Usuarios de prueba (seed)

| Nombre         | Email                       | Contraseña  | Rol      |
|----------------|-----------------------------|-------------|----------|
| Carla Mendoza  | carla@huacabistro.com       | Admin123!   | ADMIN    |
| Luis Quispe    | luis@huacabistro.com        | Mesero123!  | MESERO   |
| Roberto Ccari  | roberto@huacabistro.com     | Cocina123!  | COCINERO |
| Andrea Flores  | andrea@huacabistro.com      | Caja123!    | CAJERO   |

---

## Módulos por rol

| Módulo        | ADMIN | MESERO | COCINERO | CAJERO |
|---------------|:-----:|:------:|:--------:|:------:|
| Dashboard     | ✅    | ✅     |          | ✅     |
| Mesas         | ✅    | ✅     |          |        |
| Pedidos       | ✅    | ✅     |          |        |
| Cocina        | ✅    |        | ✅       |        |
| Menú          | ✅    |        |          |        |
| Inventario    | ✅    |        |          |        |
| Reportes      | ✅    |        |          | ✅     |
| Caja          | ✅    |        |          | ✅     |
| Usuarios      | ✅    |        |          |        |
| Configuración | ✅    |        |          |        |

---

## Flujo de pedido

```
PENDIENTE → EN_COCINA → EN_PREPARACION → LISTO → ENTREGADO → PAGADO
```

1. Mesero crea pedido → va directo a **EN_COCINA** (mesa pasa a OCUPADA)
2. Cocinero inicia → **EN_PREPARACION**
3. Cocinero termina → **LISTO**
4. Mesero entrega → **ENTREGADO** (inicia timer de mesa)
5. Caja cobra → **PAGADO** (mesa vuelve a LIBRE)

---

## Estructura

```
restaurantos/
├── backend/          Express + Prisma API
│   ├── prisma/       Schema + seed
│   └── src/          Controllers, routes, middleware
└── frontend/         React SPA
    └── src/
        ├── pages/    Una página por módulo
        ├── components/  UI + Layout
        ├── services/    Axios calls
        └── store/       Zustand (auth + ui)
```
