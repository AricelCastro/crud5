<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const alumnos = ref([])

const nuevoAlumno = ref({
  id: null,
  nombre: '',
  apellido: '',
  carrera: '',
  telefono: '',
  imagenURL: ''
})

const editado = ref(false)
const errores = ref({})

const API = 'http://localhost:8081/alumnos'

// =====================
// Cargar alumnos
// =====================
const cargarAlumnos = async () => {
  try {
    const response = await axios.get(`${API}/traer-alumnos`)
    alumnos.value = response.data
  } catch (error) {
    console.error(error)
  }
}

// =====================
// Validación
// =====================
const validarFormulario = () => {

  errores.value = {}

  if (!nuevoAlumno.value.nombre.trim()) {
    errores.value.nombre = "El campo es obligatorio"
  }

  if (!nuevoAlumno.value.apellido.trim()) {
    errores.value.apellido = "El campo es obligatorio"
  } else {
    const cantidadApellidos =
      nuevoAlumno.value.apellido.trim().split(/\s+/).length

    if (cantidadApellidos < 2) {
      errores.value.apellido = "Debes ingresar dos apellidos"
    }
  }

  if (!nuevoAlumno.value.carrera.trim()) {
    errores.value.carrera = "Seleccione una carrera"
  }

  if (!/^\d{10}$/.test(nuevoAlumno.value.telefono)) {
    errores.value.telefono = "El teléfono debe tener 10 dígitos"
  }

  return Object.keys(errores.value).length === 0
}

// =====================
// Agregar / Actualizar
// =====================
const agregarAlumno = async () => {

  if (!validarFormulario()) {

    Swal.fire({
      icon: 'error',
      title: 'Formulario inválido',
      text: 'Por favor corrige los errores'
    })

    return
  }

  try {

    const payload = {
      nombre: nuevoAlumno.value.nombre,
      apellido: nuevoAlumno.value.apellido,
      carrera: nuevoAlumno.value.carrera,
      telefono: nuevoAlumno.value.telefono,
      imagenURL: nuevoAlumno.value.imagenURL,
      numeroControl: '',
      email: ''
    }

    if (editado.value) {

      await axios.put(
        `${API}/editar-alumnos/${nuevoAlumno.value.id}`,
        payload
      )

      Swal.fire(
        'Actualizado',
        'Alumno actualizado correctamente',
        'success'
      )

      editado.value = false

    } else {

      await axios.post(
        `${API}/insertar-alumnos`,
        payload
      )

      Swal.fire(
        'Guardado',
        'Alumno agregado correctamente',
        'success'
      )

    }

    await cargarAlumnos()

    nuevoAlumno.value = {
      id: null,
      nombre: '',
      apellido: '',
      carrera: '',
      telefono: '',
      imagenURL: ''
    }

    errores.value = {}

  } catch (error) {

    console.error(error)

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un problema al guardar'
    })

  }
}

// =====================
// Editar
// =====================
const editarAlumnos = (alumno) => {

  nuevoAlumno.value = { ...alumno }

  editado.value = true

}

// =====================
// Eliminar
// =====================
const eliminarAlumno = async (id) => {

  Swal.fire({
    title: '¿Estás seguro?',
    text: "No podrás revertir esto",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar'
  }).then(async (result) => {

    if (result.isConfirmed) {

      try {

        await axios.delete(`${API}/eliminar-alumnos/${id}`)

        await cargarAlumnos()

        Swal.fire(
          'Eliminado!',
          'El alumno ha sido eliminado.',
          'success'
        )

      } catch (error) {

        console.error(error)

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el alumno.'
        })

      }

    }

  })
}

// =====================
// Al iniciar
// =====================
onMounted(() => {

  cargarAlumnos()

})
</script>

<template>

<div class="container mt-4">

<div class="card shadow p-4 mb-4">

<h2 class="text-center mb-4">
Formulario de Alumnos
</h2>

<form @submit.prevent="agregarAlumno">

<div class="row">

<!-- Nombre -->
<div class="col-md-6 mb-3">

<label class="form-label">Nombre</label>

<input type="text"
class="form-control"
:class="{ 'is-invalid': errores.nombre }"
v-model="nuevoAlumno.nombre"
maxlength="50">

<small class="text-danger" v-if="errores.nombre">
{{ errores.nombre }}
</small>

</div>

<!-- Apellidos -->
<div class="col-md-6 mb-3">

<label class="form-label">
Apellidos (paterno y materno)
</label>

<input type="text"
class="form-control"
:class="{ 'is-invalid': errores.apellido }"
v-model="nuevoAlumno.apellido"
maxlength="70">

<small class="text-danger" v-if="errores.apellido">
{{ errores.apellido }}
</small>

</div>

<!-- Carrera -->
<div class="col-md-6 mb-3">

<label class="form-label">Carrera</label>

<select class="form-select"
:class="{ 'is-invalid': errores.carrera }"
v-model="nuevoAlumno.carrera">

<option value="" disabled>
Seleccione una carrera
</option>

<option>
Ingeniería en Sistemas Computacionales
</option>

<option>
Ingeniería Industrial
</option>

<option>
Licenciatura en Contaduría
</option>

<option>
Licenciatura en Administración
</option>

<option>
Ingeniería en Mecatrónica
</option>

<option>
Ingeniería en Gestión Empresarial
</option>

</select>

<small class="text-danger" v-if="errores.carrera">
{{ errores.carrera }}
</small>

</div>

<!-- Teléfono -->
<div class="col-md-6 mb-3">

<label class="form-label">Teléfono</label>

<div class="input-group">

<span class="input-group-text">
+52
</span>

<input type="text"
class="form-control"
:class="{ 'is-invalid': errores.telefono }"
v-model="nuevoAlumno.telefono"
maxlength="10">

</div>

<small class="text-danger" v-if="errores.telefono">
{{ errores.telefono }}
</small>

</div>

<!-- Imagen URL -->
<div class="col-md-6 mb-3">

<label class="form-label">
Imagen URL
</label>

<input type="text"
class="form-control"
v-model="nuevoAlumno.imagenURL">

</div>

</div>

<button type="submit"
class="btn btn-primary">

{{ editado ? 'Actualizar Alumno' : 'Agregar Alumno' }}

</button>

</form>

</div>

<!-- TABLA -->

<div class="card shadow">

<div class="card-body">

<h5 class="mb-3">
Lista de Alumnos
</h5>

<table class="table table-hover align-middle">

<thead class="table-light">

<tr>

<th>ID</th>
<th>Nombre</th>
<th>Apellidos</th>
<th>Carrera</th>
<th>Teléfono</th>
<th>Imagen</th>
<th>Acciones</th>

</tr>

</thead>

<tbody>

<tr v-for="alumno in alumnos"
:key="alumno.id">

<td>{{ alumno.id }}</td>

<td>{{ alumno.nombre }}</td>

<td>{{ alumno.apellido }}</td>

<td>{{ alumno.carrera }}</td>

<td>{{ alumno.telefono }}</td>

<td>

<img v-if="alumno.imagenURL"
:src="alumno.imagenURL"
width="50">

</td>

<td>

<button
class="btn btn-danger mx-2"
@click="eliminarAlumno(alumno.id)">

🗑

</button>

<button
class="btn btn-warning"
@click="editarAlumnos(alumno)">

✏

</button>

</td>

</tr>

</tbody>

</table>

</div>

</div>

</div>

</template>

<style scoped>
img{
border-radius:6px;
}
</style>