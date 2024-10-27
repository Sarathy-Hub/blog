import { Hono } from 'hono'
import { PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from '@prisma/extension-accelerate'

import { sign } from "hono/jwt"

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>

// POST - User Signup 
app.post('/api/v1/user/signup', async (c) => {

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate())

  const body = await c.req.json()

  try {

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name
      }
    })

    const JWT = await sign({
      userId: user.userId
    }, c.env.JWT_SECRET)
  
    return c.json({
      msg: `User with ${body.email} created successfully!`,
      token: JWT
    })

  } catch (error) {

    c.status(403)
    return c.json({
      msg: "Error creating the user"
    })

  }

})


// POST - User Signin
app.post('/api/v1/user/signin', async (c) => {

  const prisma = new PrismaClient ({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate())

  const body = await c.req.json()

  try {

    const userExists = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: body.password
      }
    })

    if (!userExists) {

      return c.json({
        msg: "Username or Password incorrect!"
      })

    } else {

      const JWT = await sign ({
        userId: userExists.userId
      }, c.env.JWT_SECRET)

      return c.json ({
        msg: `Hello, ${userExists.name}`,
        token: JWT
      })

    }

  } catch (error) {

    return c.json({
      msg: "Error trying to login. Please try later!"
    })

  }

})

// POST - Create Blog
app.post('/api/v1/blog', (c) => {
  return c.text("Create a Blog")
})

// PUT - Update an existing blog
app.put('/api/v1/blog', (c) => {
  return c.text("Update Blog")
})

// GET - Read a blog by its ID
app.get('/api/v1/blog/:blogID', (c) => {
  return c.text("Fetching the blog with blog ID")
})

// GET - Read all the blogs
app.get('/api/v1/blog/bulk', (c) => {
  return c.text("Fetching all the blogs")
})

export default app