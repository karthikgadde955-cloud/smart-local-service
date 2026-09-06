# Smart Ranking Engine — Mathematical Specification

The backend `SmartRankingService` calculates a centralized provider score between 0 and 100 based on multi-factor weighted equations:

$$Score = \sum_{i} (W_i \times S_i)$$

Where $W_i$ represents configurable factor weightings and $S_i$ represents normalized factor scores (0–100).

---

## 1. Weight Configurations

| Mode | Skill Match ($W_1$) | Proximity ($W_2$) | Rating ($W_3$) | Availability ($W_4$) | Price ($W_5$) | Experience ($W_6$) | ETA ($W_7$) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Smart Repair** | 30% | 20% | 15% | 15% | 10% | 10% | 0% |
| **Preventive Maintenance** | 30% | 20% | 15% | 15% | 10% | 10% | 0% |
| **AI Emergency Rescue** | 15% | 25% | 10% | 25% | 5% | 0% | 20% |

---

## 2. Factor Scoring Formulas

### A. Distance Proximity Score ($S_{distance}$)
Calculated using the Haversine distance formula $d$ (in km) between customer $(lat_1, lon_1)$ and provider $(lat_2, lon_2)$:

$$S_{distance} = \max(0, \min(100, 100 - (d \times 8)))$$

### B. ETA Score ($S_{eta}$)
Estimated arrival time $ETA = \max(5, \text{Math.round}(d \times 2.4 + \text{responseTime}))$.

$$S_{eta} = \max(0, \min(100, 100 - (ETA \times 2.5)))$$

### C. Skill Match Score ($S_{skill}$)
- **100**: Direct exact match on specific appliance skill (e.g. Washing Machine Drainage Repair).
- **80**: Service category match.
- **30**: Generic worker match.

### D. Rating Score ($S_{rating}$)
$$S_{rating} = \min(100, (\text{Rating} / 5.0) \times 100)$$

### E. Availability Score ($S_{avail}$)
- **100**: `availableNow = true`
- **40**: Scheduled available later
