import { api } from './api';

export const menuService = {
  getProductos: () => api.get('/menu/productos').then((r) => r.data),
  createProducto: (data: any) => api.post('/menu/productos', data).then((r) => r.data),
  updateProducto: (id: string, data: any) => api.put(`/menu/productos/${id}`, data).then((r) => r.data),
  deleteProducto: (id: string) => api.delete(`/menu/productos/${id}`),
  getCategorias: () => api.get('/menu/categorias').then((r) => r.data),
  createCategoria: (nombre: string) => api.post('/menu/categorias', { nombre }).then((r) => r.data),
};
