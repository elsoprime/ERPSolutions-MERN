/** Autor: @elsoprimeDEV */

//Modulo para inicializar las credenciales de la aplicacion
import bcrypt from 'bcrypt'
import Company from '../models/Company'
import User from '../models/User'
import colors, {yellow} from 'colors'

export async function getOrCreateCompany() {
  try {
    let dni = '15.288.220-3'
    // Verificar si la empresa ya existe por nombre
    const rutOrDniExist = await Company.findOne({
      rutOrDni: dni
    })

    if (rutOrDniExist) {
      console.log(
        colors.bgWhite.cyan.bold(
          `El Rut ${rutOrDniExist.rutOrDni} ya se encuentra registrado`
        )
      )
      return rutOrDniExist.id // Retorna el ID de la empresa existente
    } else {
      // Crear una nueva empresa si no existe
      const newCompany = await Company.create({
        companyName: 'ERP Soluciones SPA',
        rutOrDni: '15.288.220-3', // RUT o DNI de la compañía
        description: 'Software Developed by ELSOMEDIA',
        email: 'info@elsomediadev.com', // Correo electrónico de la compañía
        incorporationDate: new Date(),
        industry: 'Tecnología', //
        address: '1234 Calle Ejemplo, Santiago', // Dirección de la compañía
        phoneNumber: '+56 9 1234 5678', // Número de teléfono de la compañía
        facilities: [] // Puedes agregar instalaciones aquí si es necesario
      })
      console.log(colors.green.bold(`Nueva empresa creada exitosamente`))
      return newCompany.id // Retorna el ID de la nueva empresa
    }
  } catch (error) {
    console.error(
      colors.bgYellow.red(`Error al registrar la Nueva Empresa`),
      error
    )
    throw error
  }
}

export async function initializeAdminUser() {
  try {
    const adminUser = await User.findOne({email: 'admin@elsomedia.cl'})

    if (adminUser) {
      console.log(
        colors.bgWhite.cyan(
          `El Usuario con el Rol de Administrador ${adminUser.name} ya se encuentra Registrado`
        )
      )
      return adminUser.email
    }

    if (!adminUser) {
      // Primero, obtenemos o creamos la empresa
      const companyId = await getOrCreateCompany()

      const hashedPassword = await bcrypt.hash(
        process.env.USER_ADMIN_PASSWORD || 'defaultpassword',
        10
      )

      await User.create({
        name: 'Admin',
        email: 'admin@elsomedia.cl',
        password: hashedPassword,
        status: 'active',
        token: false,
        role: 'admin',
        companyId: companyId // Usamos el ID de la empresa creada
      })
      console.log('Usuario administrador creado exitosamente.')
    } else {
      const passwordMatch = await bcrypt.compare(
        process.env.USER_ADMIN_PASSWORD || 'defaultpassword',
        adminUser.password
      )

      if (!passwordMatch) {
        const hashedPassword = await bcrypt.hash(
          process.env.USER_ADMIN_PASSWORD || 'defaultpassword',
          10
        )

        await User.updateOne(
          {email: 'admin@elsomedia.cl'},
          {password: hashedPassword}
        )

        console.log('Contraseña del usuario administrador actualizada.')
      } else {
        console.log(
          colors.bgMagenta.white(
            'El usuario administrador ya existe y la contraseña está actualizada.'
          )
        )
      }
    }
  } catch (error) {
    console.error(
      colors.bgYellow.red('Error al inicializar el usuario administrador:'),
      error
    )
  }
}
