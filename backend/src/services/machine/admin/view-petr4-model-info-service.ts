export class ViewPETR4ModelInfoService {
  async execute() {

    try {
      const response = await fetch(`${process.env.PYTHON_SERVER_URL}/petr4/info`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (response.status !== 200) {
        const error = await response.json().catch(() => ({})) as any
        throw new Error(error.message)
      }

      return await response.json()

    } catch (error: any) {
      throw new Error(`Failed to get the PETR4 model info from Python server: ${error.message}`)
    }
  }
}