export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          nombre: string
          rol: Database["public"]["Enums"]["rol_admin"]
        }
        Insert: {
          created_at?: string
          id: string
          nombre: string
          rol?: Database["public"]["Enums"]["rol_admin"]
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          rol?: Database["public"]["Enums"]["rol_admin"]
        }
        Relationships: []
      }
      categorias: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          nombre: string
          orden: number
          slug: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre: string
          orden?: number
          slug: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre?: string
          orden?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      cierres_caja: {
        Row: {
          cantidad_efectivo: number
          cantidad_transferencia: number
          cerrado_por: string | null
          created_at: string
          fecha: string
          id: string
          total_efectivo: number
          total_pedidos: number
          total_transferencia: number
          total_ventas: number
          updated_at: string
        }
        Insert: {
          cantidad_efectivo?: number
          cantidad_transferencia?: number
          cerrado_por?: string | null
          created_at?: string
          fecha: string
          id?: string
          total_efectivo?: number
          total_pedidos?: number
          total_transferencia?: number
          total_ventas?: number
          updated_at?: string
        }
        Update: {
          cantidad_efectivo?: number
          cantidad_transferencia?: number
          cerrado_por?: string | null
          created_at?: string
          fecha?: string
          id?: string
          total_efectivo?: number
          total_pedidos?: number
          total_transferencia?: number
          total_ventas?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cierres_caja_cerrado_por_fkey"
            columns: ["cerrado_por"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion_restaurante: {
        Row: {
          banco_documento: string | null
          banco_nombre: string | null
          banco_numero_cuenta: string | null
          banco_tipo_cuenta: string | null
          banco_titular: string | null
          costo_domicilio_default: number
          direccion: string | null
          fotos_panoramicas: string[]
          horario_atencion: Json
          id: number
          nombre_restaurante: string
          qr_transferencia_url: string | null
          redes_sociales: Json
          telefono: string | null
          updated_at: string
        }
        Insert: {
          banco_documento?: string | null
          banco_nombre?: string | null
          banco_numero_cuenta?: string | null
          banco_tipo_cuenta?: string | null
          banco_titular?: string | null
          costo_domicilio_default?: number
          direccion?: string | null
          fotos_panoramicas?: string[]
          horario_atencion?: Json
          id?: number
          nombre_restaurante?: string
          qr_transferencia_url?: string | null
          redes_sociales?: Json
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          banco_documento?: string | null
          banco_nombre?: string | null
          banco_numero_cuenta?: string | null
          banco_tipo_cuenta?: string | null
          banco_titular?: string | null
          costo_domicilio_default?: number
          direccion?: string | null
          fotos_panoramicas?: string[]
          horario_atencion?: Json
          id?: number
          nombre_restaurante?: string
          qr_transferencia_url?: string | null
          redes_sociales?: Json
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      detalle_pedido: {
        Row: {
          cantidad: number
          id: string
          pedido_id: string
          producto_id: string | null
          producto_nombre: string
          producto_precio: number
          subtotal_linea: number
        }
        Insert: {
          cantidad: number
          id?: string
          pedido_id: string
          producto_id?: string | null
          producto_nombre: string
          producto_precio: number
          subtotal_linea: number
        }
        Update: {
          cantidad?: number
          id?: string
          pedido_id?: string
          producto_id?: string | null
          producto_nombre?: string
          producto_precio?: number
          subtotal_linea?: number
        }
        Relationships: [
          {
            foreignKeyName: "detalle_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detalle_pedido_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      devoluciones: {
        Row: {
          created_at: string
          id: string
          motivo: string
          pedido_id: string
          registrado_por: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          motivo: string
          pedido_id: string
          registrado_por?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          motivo?: string
          pedido_id?: string
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devoluciones_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: true
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devoluciones_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_estado_pedido: {
        Row: {
          cambiado_por: string | null
          created_at: string
          estado_anterior:
            | Database["public"]["Enums"]["estado_pedido_enum"]
            | null
          estado_nuevo: Database["public"]["Enums"]["estado_pedido_enum"]
          id: string
          nota: string | null
          pedido_id: string
        }
        Insert: {
          cambiado_por?: string | null
          created_at?: string
          estado_anterior?:
            | Database["public"]["Enums"]["estado_pedido_enum"]
            | null
          estado_nuevo: Database["public"]["Enums"]["estado_pedido_enum"]
          id?: string
          nota?: string | null
          pedido_id: string
        }
        Update: {
          cambiado_por?: string | null
          created_at?: string
          estado_anterior?:
            | Database["public"]["Enums"]["estado_pedido_enum"]
            | null
          estado_nuevo?: Database["public"]["Enums"]["estado_pedido_enum"]
          id?: string
          nota?: string | null
          pedido_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historial_estado_pedido_cambiado_por_fkey"
            columns: ["cambiado_por"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_estado_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cliente_barrio: string | null
          cliente_direccion: string | null
          cliente_email: string | null
          cliente_nombre: string
          cliente_notas: string | null
          cliente_referencia: string | null
          cliente_telefono: string
          codigo_seguimiento: string
          costo_domicilio: number
          created_at: string
          efectivo_paga_con: number | null
          estado_pago: Database["public"]["Enums"]["estado_pago_enum"]
          estado_pedido: Database["public"]["Enums"]["estado_pedido_enum"]
          id: string
          metodo_pago: Database["public"]["Enums"]["metodo_pago_enum"]
          pago_reportado_cliente_at: string | null
          propina: number
          subtotal: number
          tipo_entrega: Database["public"]["Enums"]["tipo_entrega_enum"]
          total: number
          updated_at: string
        }
        Insert: {
          cliente_barrio?: string | null
          cliente_direccion?: string | null
          cliente_email?: string | null
          cliente_nombre: string
          cliente_notas?: string | null
          cliente_referencia?: string | null
          cliente_telefono: string
          codigo_seguimiento?: string
          costo_domicilio?: number
          created_at?: string
          efectivo_paga_con?: number | null
          estado_pago: Database["public"]["Enums"]["estado_pago_enum"]
          estado_pedido?: Database["public"]["Enums"]["estado_pedido_enum"]
          id?: string
          metodo_pago: Database["public"]["Enums"]["metodo_pago_enum"]
          pago_reportado_cliente_at?: string | null
          propina?: number
          subtotal: number
          tipo_entrega: Database["public"]["Enums"]["tipo_entrega_enum"]
          total: number
          updated_at?: string
        }
        Update: {
          cliente_barrio?: string | null
          cliente_direccion?: string | null
          cliente_email?: string | null
          cliente_nombre?: string
          cliente_notas?: string | null
          cliente_referencia?: string | null
          cliente_telefono?: string
          codigo_seguimiento?: string
          costo_domicilio?: number
          created_at?: string
          efectivo_paga_con?: number | null
          estado_pago?: Database["public"]["Enums"]["estado_pago_enum"]
          estado_pedido?: Database["public"]["Enums"]["estado_pedido_enum"]
          id?: string
          metodo_pago?: Database["public"]["Enums"]["metodo_pago_enum"]
          pago_reportado_cliente_at?: string | null
          propina?: number
          subtotal?: number
          tipo_entrega?: Database["public"]["Enums"]["tipo_entrega_enum"]
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      productos: {
        Row: {
          categoria_id: string
          created_at: string
          descripcion: string | null
          disponible: boolean
          etiqueta: string | null
          id: string
          imagen_url: string | null
          nombre: string
          orden: number
          precio: number
          updated_at: string
        }
        Insert: {
          categoria_id: string
          created_at?: string
          descripcion?: string | null
          disponible?: boolean
          etiqueta?: string | null
          id?: string
          imagen_url?: string | null
          nombre: string
          orden?: number
          precio: number
          updated_at?: string
        }
        Update: {
          categoria_id?: string
          created_at?: string
          descripcion?: string | null
          disponible?: boolean
          etiqueta?: string | null
          id?: string
          imagen_url?: string | null
          nombre?: string
          orden?: number
          precio?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      resenas: {
        Row: {
          aprobado: boolean
          calificacion: number
          cliente_nombre: string
          comentario: string
          created_at: string
          id: string
          pedido_id: string
          producto_id: string | null
        }
        Insert: {
          aprobado?: boolean
          calificacion: number
          cliente_nombre: string
          comentario: string
          created_at?: string
          id?: string
          pedido_id: string
          producto_id?: string | null
        }
        Update: {
          aprobado?: boolean
          calificacion?: number
          cliente_nombre?: string
          comentario?: string
          created_at?: string
          id?: string
          pedido_id?: string
          producto_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resenas_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resenas_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aplicar_cambio_estado_pedido: {
        Args: {
          p_admin_id: string
          p_estado_nuevo: Database["public"]["Enums"]["estado_pedido_enum"]
          p_estado_pago_nuevo: Database["public"]["Enums"]["estado_pago_enum"]
          p_nota?: string | null
          p_pedido_id: string
        }
        Returns: Database["public"]["Tables"]["pedidos"]["Row"]
      }
      crear_pedido: {
        Args: { payload: Json }
        Returns: Database["public"]["Tables"]["pedidos"]["Row"]
      }
      generar_codigo_seguimiento: { Args: Record<string, never>; Returns: string }
    }
    Enums: {
      estado_pago_enum:
        | "pendiente"
        | "por_verificar"
        | "confirmado"
        | "rechazado"
      estado_pedido_enum:
        | "pendiente"
        | "confirmado"
        | "preparando"
        | "en_ruta"
        | "listo_para_recoger"
        | "entregado"
        | "cancelado"
      metodo_pago_enum: "efectivo" | "transferencia"
      rol_admin: "admin"
      tipo_entrega_enum: "domicilio" | "recoger"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]
export type Enums<T extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][T]
