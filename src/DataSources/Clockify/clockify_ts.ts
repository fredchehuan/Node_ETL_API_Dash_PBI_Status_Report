import Body  from 'node-fetch';
import axios, { AxiosResponse } from 'axios';
import nodeFetch from 'node-fetch';

//const key = process.env.CLOCKIFY_API_KEY || ''
const key = 'Y2QzODNlZTctYjY1My00ODFkLWFlMGEtOGI1MmYzODljYjJi'
const url = `https://api.clockify.me/api/v1`

if (!key) {
  console.log(`API key must be provided through 'CLOCKIFY_API_KEY' env variable. Get one at https://clockify.me/user/settings`)
  
  //process.exit(1) 
}

interface ClockifyUser { id: string, name: string, defaultWorkspace: string }

;(async () => {
  // with axios
  const axiosResponse: AxiosResponse<ClockifyUser> = await axios.get(`${url}/user`, {
    headers: {
	  'X-Api-Key': key
	}
  })
  console.log(`Welcome ${axiosResponse.data.name}`)
  
  // with node-fetch
  const fetchResponse: ClockifyUser = await nodeFetch(`${url}/user`, {
    headers: {
	  'X-Api-Key': key
	}
  }).then((r: Body) => r.json())
  console.log(`Your default workspace ID is ${fetchResponse.defaultWorkspace}`)
})()

// PARA BUSCARMOS OS TIME ENTRIES DO CLOCKFY PRECISAMOS:
// 1- id workspace = 60a6c734b7cf50345092ad5b
// 2 - buscar os ids dos projetos (id) e dos usuarios (memberships -> userId) do workspace atraves da api "Clockfy get all projects on workspace"
// 3 - buscar os tiem entries dos usuarios atraves da api "Clockfy Get your time entries on workspace"
// userId fred = 60df8f875f596c5a7d0fd235