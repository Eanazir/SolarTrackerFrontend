// server/src/utils/scaler.ts

export interface ScalerParams {
    min_: number[];          // For MinMaxScaler: min_ = -data_min_ / data_range_
    scale_: number[];        // For MinMaxScaler: scale_ = 1 / data_range_
    data_min_: number[];     // Minimum value per feature in the training data
    data_max_: number[];     // Maximum value per feature in the training data
    data_range_: number[];   // Range (data_max_ - data_min_) per feature
}

export class Scaler {
    min_: number[];
    scale_: number[];
    data_min_: number[];
    data_max_: number[];
    data_range_: number[];

    constructor(params: ScalerParams) {
        this.min_ = params.min_;
        this.scale_ = params.scale_;
        this.data_min_ = params.data_min_;
        this.data_max_ = params.data_max_;
        this.data_range_ = params.data_range_;
    }

    /**
     * Scales the input features using MinMaxScaler.
     * Formula: X_scaled = (X - data_min_) / data_range_
     * 
     * @param features - Array of feature values to scale
     * @returns Scaled feature values
     */
    scaleFeatures(features: number[]): number[] {
        return features.map((val, idx) => (val - this.data_min_[idx]) / this.data_range_[idx]);
    }

    /**
     * Inverse scales the prediction outputs using MinMaxScaler.
     * Formula: X_original = X_scaled * data_range_ + data_min_
     * 
     * @param features - Array of scaled prediction values to inverse scale
     * @returns Inverse-scaled prediction values
     */
    inverseScaleFeatures(features: number[]): number[] {
        return features.map((val, idx) => (val * this.data_range_[idx]) + this.data_min_[idx]);
    }

    scaleInputData(inputData: number[][]): number[][] {
        if (!this.data_min_ || !this.data_range_) {
            throw new Error('Scaler is not properly initialized.');
        }

        return inputData.map((features, rowIndex) => {
            if (features.length !== this.data_min_.length) {
                throw new Error(
                    `Feature length mismatch at row ${rowIndex}: expected ${this.data_min_.length}, got ${features.length}`
                );
            }
            return this.scaleFeatures(features);
        });
    }

    
}

