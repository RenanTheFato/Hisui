interface Petr4Props {
  period: string,
  retrain?: boolean,
}

export class PredictPETR4Service {
  async execute({ period, retrain }: Petr4Props) {
    try {
      const response = await fetch(`${process.env.PYTHON_SERVER_URL}/petr4/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          period,
          retrain,
        })
      })

      if (response.status !== 200) {
        const error = await response.json().catch(() => ({})) as any
        throw new Error(error.message)
      }

      return await response.json()

    } catch (error: any) {
      throw new Error(`Failed to get prediction from Python server: ${error.message}`)
    }
  }
}