from pydantic import BaseModel, Field


class SamplePredictionRequest(BaseModel):
    sample_id: str = Field(..., description="Identifier of the pre-loaded demonstration sample.")
