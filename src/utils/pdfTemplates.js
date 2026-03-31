import { obterGarantia, calcGarantiaDate } from './garantias.js'
import { formatMoney, formatDate } from './formatters.js'

// Logo Core Distribuidora em Base64
const LOGO_BASE64 = "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kiVbtmxxoEEQwv8nOTm5Q4cOl1566cUXX9yoUaPExJBH2sGDBz/99NP3339/xowZX375ZZH2tnz58hdeeGGXLl06d+588sknF2ILO3bsmD179rRp0+bMmXPgwIGw93DSpEk9evQ4zo3k5+fn5uYePnx4//79e/bs2b1799atWzMzM9etW/fFF1+sXr360KFDMdjtQti7d2+lSpV8DYHoOPXUU//85z/v3r07P3xWrlw5YMCAatWqhb23zZo1e+GFF7Kzs8PV1ezs7Oeff75p06ZhT5T8IpaTk/PBBx/84Q9/qFmzZjHq9n/0448/+iYCUdCqVauZM2cW3dnt4MGDf/3rX5s0aRKW3jZt2nT69OlF19t33303XF2NcKLk5eVNnTr1jDPOEIQAQVWvXv1vf/vb0aNHI3Oa7t+///H0Ni0tbdSoUUeOHCnqrubm5o4cObJ8+fLFNFHGjx9ftWpVQQjwC3r06LFr165InuZefPHFQvf2zDPPXL9+fSR7u27dunbt2hXTS6vMzMyWLVsKQkq2UkpAoZUpU+bll1+eNGlSlSpVikWHe/XqtWDBgoyMjEh+aMOGDT/99NOePXsWx0N8yimnfPTRRy1atDDaEYTw7ypXrjxnzpxevXoVlw4/9NBDL7/8cunSpaPyL4Zx48YNHDiwmB7oadOmVaxY0ZhHEML/7+Q4f/78jh07FpcOP/LII48//nh0+zBkyJBimoX16tUbNmyYYY8ghP9XhQoVZs+e3bx58+LS4d69ez/66KOx0JMhQ4YU03ukvXv3btCggcGPIISExMTEN9988/if/oiYs84664UXXoid/owdO7Zt27bF7riXLl26d+/exj8lUmklICSDBg26+OKLC/3ne/funT179qeffrp69epNmzbt3r17//79ZcqUSU1NrVatWr169Ro1atS+fftzzjknPT09LBevEydOLNzvgtnZ2dOmTZs7d+7KlSszMzP37dtXqlSptLS0evXqnXbaab/+9a+7du1aiKkRZcqU+dvf/tamTZv9+/cXr0Pfo0ePYnprFyBszj777EJPv1u0aFH37t2Tk5MDflbr1q0HDx68ffv245k+MXr06EJ0dffu3f37909LS/vFlO3fv3/h1tAZMWJESJUPaR7Cf7x0O/ZPjTZt2txwww0TJ07ct29fIbp9yimnRLjbADEkKSlpxYoVhTh7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e++9onsg/tChQxMmTAi+PmfBmjdvXqS9nTVrVrNmzcJV24jNTD/33HND2s1PPvkkXN02fQIoIZo0aTJ8+PDCrbdSwFrP999//0knnRT23p522mljxozZv39/uLqanZ09evToFi1ahLefkVyiZf78+SHt8vnnny8IAf5dcnJyp06dnnvuuXXr1hX6+m/+/PkPPPBA8+bNi7q3aWlp3bt3Hz9+/M6dOwvX2+++++6vf/1r9+7dQ10yJgaD8Ne//nVI+/73v/9dEFKsJSoBRe3EE09s06ZN69atGzRokJ6eXrt27apVq6akpKSkpJQrV+7IkSOHDh3au3fvzp07t2/fvmHDhq+++urzzz//4osvDh06FPne1q1bt127di1btqxbt256enqtWrUqVKiQmpqakpKSn5+fk5OTk5OTlZW1bdu2zZs3Z2ZmrlixYunSpZmZmQ40AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAxVGZMmXmzZuXX6CxY8cqFAAl00svvZQfQP/+/dUKgJJmwIAB+cHk5eV17dpVxQAoOS6//PKjR4/+PPNWrFixdevWn//37Ozs1q1bqxsAJUGbNm3279//87R74403UlNTTz755AULFvz8/27durVmzZqqB0DxVqtWrW3btv385uf999//rzbJycmjR4/+eRYuW7YsNTVVDQEorsqXL//555//W7zt2bOnc+fOP298xx13HD58+N8aT5kypVSpUioJQPFTqlSpqVOn/luwrV27tmHDhv/tT84+++wdO3b82588/fTTiglA8fPss8/+W6RNmzatQoUKBf9V7dq1P/vss3/7w1tvvVU9AQAAAAAAACCcEpUAitQJJ5xw+umnt2vXrnHjxnXq1ElPT69UqVJKSkpKSsqRI0cOHDhw4MCBb7/9dsuWLZmZmZ9//vmSJUvWrVuXn5+vdNGSmpraqlWrtm3bNm3aND09PT09vVq1ascOWWJiYlZW1r59+/bt2/f999+vXbt2zZo1q1evXrVq1b59+wyk6tWrd+jQoXXr1sdKV7169QoVKpQrVy4hISHn/2RlZX377bfb/s+6devWrl377bffluQhNXLkyPyI+PHHH8PYn5EjR5bUmkyaNCk/Ztx8881hr8/hw4ezs7N37Nixdu3aefPmvfLKKw888EDnzp2rVq0ayZFft27de++9d8GCBXl5eaHuwnfffffSSy9deumlSUlJkR9yhXtUtVu3bkE23rhx45j9ntarV+/uu++eN29ebm5uqIcsNzf373//+4ABA5o1a1aCB9J/U7ly5XvuuWfp0qWF/tru2bPn008/feGFF3r27NmoUSNBKAgFYZHU5+jRo8uWLXvwwQfr1KlTpGO+Y8eOU6dOLcRp6+c2b948cODASpUqRXLIbd68+dg/4eMnCC+99NJZs2aF5ZAdmzN65513/uKEmeI4kH6uQoUKw4YNy87ODu+3ddeuXW+99VbEcsrSFcTNzwCJiW3atBk8ePDGjRsnTJhQt27dsH9EkyZNZs6cOW/evK5du4ZlXZj09PQhQ4asX7++T58+pUuXjkyh0tPT77zzzjgZFR07dly8ePH06dM7d+4crqV8mjRpMnLkyG3bthV6SYTiMpA6duz4z3/+c8CAAeXLlw/vcalSpUqnTp0EIRSVpKSkG264YfXq1bfffnsYU3bAgAErVqy45JJLwt7hqlWr/uUvf1m4cGFGRkZkSjRw4MCKFSuW7GFQqVKliRMnzps374wzziiK7VeoUOG6664rwQPp9ttv//DDD0vGAvGCkDhVvnz50aNHDxky5Pg3dcIJJ7z//vvDhg0rU6ZM0XW4Xbt2y5cv7969ewSKU6VKlXvvvbcEH/2zzz571apV119/fUz1qhgNpFtvvXX06NFF/dOjIIQIXfr87ne/O54t1KxZ85NPPonMbZy0tLQ333zzODscUL9+/U466aQSedCvueaauXPn1q5dO6Z6VYwGUvv27V944YWSNCQEIfHu2WefLfSdoqpVq/79739v0aJF5L6xpUqNGjUqAlmYlpY2aNCgkne477jjjtdee61s2bIx1atiNJDKlCnz8ssvF+k1qyCESEtJSXnssccK94czZswo4J0SRWfEiBFdu3aNQGYUxSNFUXTttdc+//zziYmJsTYCi9FA6tmzZ9OmTUvYSaB0AsS9q6666q677tq1a1dIf/Xcc8+deeaZwdvn5eW9995706dPX7p06aZNm7KyspKTk6tVq9a0adPzzjvvmmuuSU9PD7ippKSk8ePHt2zZMjMzs+jKkpyc/Pjjj990000l4yi3a9du3LhxoT6EuWfPnunTp8+fP3/VqlWZmZlZWVm5ubnly5c/8cQT69Sp07hx43bt2p1//vkNGjQodMeK10Dq169fwJZLly6dOXPmZ5999vXXX+/cufPAgQNHjhxJSUmpUqVKjRo1GjZs2KxZs3bt2p1xxhlpaWkl/BRjHmGs1aTEzCP8+TEqU6ZMlSpVWrVq1atXr9mzZx89erToZpFfdtllIe3pW2+9Va9evYJPST179vz5WwkL8MknnwQ8rRd6yOXl5TVv3jzIR8T4PMJKlSpt3LgxpH1fv379TTfdlJycHGT7jRs3HjJkyPbt23+6ha1bt5awgXTaaacF2eCGDRs6dOgQPIw7duz45z//+euvvy7EKb1EBWGRBk8xDcKI1eQXzZgxI0iH+/fvH1P1Offcc3fu3BnwXPDXv/41eA/LlSu3efPm4GuOBE/Zk08+ecGCBWHP7+P5t9e7775bAoJwzJgxIa298NRTTxXid8Tk5OTbbrvtX4n7i0FY7AbSPffc84ub2rJlS6FXcWrRosXw4cN//PHHCAeh3wgpsebPn3/VVVcFbBzSzx533XVXwLtPR48eveaaa15++eWAW/7uu+8uvPDCBQsWBGz/+OOPp6amFmkZL7vssrPOOqtYj4TTTz89eIQcPnz4yiuvHDhw4KFDh0L9oMOHD48dO7ZJkyYDBw7Mzs4ueQMpyC3cQYMGhforw7+sWrWqX79+tWrVuuOOO1asWCEIITxZ+MEHHwRpecoppwS/HAw+x+6JJ5545513QurzgQMHunfvHnAN4po1a/bu3buoyzh06NBiPQyGDh0a8NZffn7+1VdfPXny5OP5uEOHDg0dOrRFixZz584tYQMpyPPVM2bMOM7jtX///jFjxpx77rmCEMJj5syZQZoFXxny2muvrVKlSpCWX3/9deEm7O/cuXPgwIEBG//ud78r6scgO3To0Llz52I6AFq2bHnBBRcEbPynP/1p2rRpYfnczMzMnj17lrCB9IvryOTm5v7www/FbpAIQkq4lStXBmkWfAHG4Auz9e/f//Dhw4Xr9vjx45cuXRqk5amnnhr8wYRCGzJkSKzNOgjorrvuCthyzZo1Dz74YMQ6VhwH0i+uKVqmTJnjX21cEEKY7d69O0izvXv3BmlWo0aNgE+6r169eurUqYXudn5+/pNPPhmwcbdu3Yq6jK1atbrmmmuK3dFPTk6+4oorAja+8847C/G7YOEU04GUl5f3ixuJwAxXQQihCbgcYsC8vPTSSwNeGE2aNOk4e/7ee+8FjOcuXbocf6G+//77NWvWFNDgiSeeKHbriVxwwQUnnHBCwDsH8+fPj1jHiulACnLbc9iwYQVP8BCEEGknnnhiwH93B2l23nnnBfzc4z9/HTp0aMqUKUFa1q9fP/gc6v/m6NGjBd8YbNCgQeHe2RtFF110UcCWo0aNimTHiulAChKENWvWXLZsWd++fcP+biZBCIXUunXrIM2WLFkSpFnbtm2DNFu/fv3XX399/J2fPXt2wJann3768X/ctGnT/vGPfxTQ4OGHHy7q2RrhFXDiR15e3uuvvx7JjhXTgbR27dqA//ocMWLE9u3bJ06ceO2119aqVUsQBnLnnXcezwIlL730Usk7g6tJWAS8bRjkWcEKFSoEXJ474BM6YdxOmzZtwvKJBT9kWKNGjd///vfF5dAnJye3bNky4P2ArKysiHWs+A6kjz76KPiHVqxY8frrr3/ttde2bt36zTffvPXWW/fee2/Hjh1jcEE1V4SUZBdddNGvfvWrX2y2aNGiIP/UrVevXsDfdcJ1/lq3bt3BgweDtKxfv35YPnH+/PkFXz3cd999Ae82R129evUCLpC2aNGiCHesmA6kuXPnHj16tBAdqFOnzpVXXvn000/Pmzdv7969q1evHjt2bK9evWJkVXdBSIl1wQUXBLzfFfB9Q3Xq1An40QU/dRJcXl7eP//5z/D2LchFYX5+/n/7v5UqVbrvvvuKxQAIvkjCZ599FsmOFd+BtG3btlDn9f+H1ClVqlmzZr1793755Zc3bdq0bt26oUOHBvwJQxDCLyhdunTlypVbtWp16623zpkzZ86cOUGuXSZOnFjwCiD/8ouzif8ljHOKAz7OGsafYb744os333yzgAa///3va9SoEfvjIfgDRAGXXwmXYj2QhgwZUsC/kwqhYcOG99133+eff/7555/fcMMNwWf0CkL4D7+hHlvVYvny5S+99FKnTp2C3H1auHBh8HnNwX/b2LdvX7h2M+CmwvuE3qBBg44cOfLf/m9KSsrDDz8c+yOkYsWKAVtG+EUHxXogffHFF8OGDSuKsrRu3XrChAlr1qyJ/DJGgpD49f777//mN7/JyckJ2D4lJSVgyzA+eRFwU+F9mHPDhg0Fr+/cu3fvgI97RFHw47Vnz57Y7FhsDqRBgwZ9+OGHRVScRo0azZo168UXXwz4+64ghEI6cODAoEGDLrnkkpAuBYK/l+fAgQPh6ur+/fvD27eAHnvssQL+iVC6dOknnngixo9y8JoEeVNEVDoWmwMpLy/v8ssvL7osTEhIuOOOO2bMmBGxBRwEIfFl//79o0ePbtiw4ZNPPhnq82/B198K4/VZwHueYV8b7Ntvvx0xYkQBDXr06NGqVatYPtbB1+eM8AP9JWAgZWdnX3zxxYMHDy7gFvpx6tSp03PPPScIIcwWLVrUpk2b3/72t9u3by/Enwe/iRrGdYcDbip434IbNmxYAVfMiYmJTz31VIxf9wdsWalSpUh2rGQMpLy8vIceeuj0008PPls/VP/7v/975ZVXCkIIp/bt269Zs2bcuHEnnXRS4a4mA7YM/phGuDZVFDf39uzZ8/TTTxfQ4OKLL47kS+NCFfwHtgjPjCxJA2nlypWdO3du167d+PHjw3gj918effTRCLz2JFaCcNSoUYnHIQLvJlWTkqF06dI9e/Zcs2ZNIc7gwa8jA75nLojKlSuHt28hee655wqeWhDLF4VbtmwJ2LJ69eqR7FjJG0hLly7t2bPnySeffM0110ycOHHHjh3h6nazZs0uu+wyV4QQflWrVn3//fc7deoU0l9t3rw5+Lc3LP1MSkpq3LhxePsWkgMHDhT8UMxZZ50VlndfFIXMzMyALc8444xIdqykDqTs7Ow33njjxhtvrFGjRsOGDXv16vXKK6989dVXx9n5Sy+9VBBCkShbtuw777zTtGnT4H+yadOmgFOJTzvttLB0slGjRuXKlQvScuPGjUVUqJdeeqngdZ+ffPLJUqVi8UySmZmZm5sbpGX79u0j2bF4GEgbNmx49dVXb7311saNG1erVq1bt27Dhw9fvnx5ISbjB39ThyAk7vz01nHp0qWrVKnSvn37AQMGBFxKKiEhoUKFCm+88UbAE0RCQsK+ffsCvgogXOevFi1aBGz5+eefF1Gdc3NzH3rooQIaNG/e/IYbbojBEXLo0KEVK1YErHMk36sebwNp165d06ZN+8Mf/tCmTZvatWv37ds34FssjsnIyCjqp5kEISVBXl7e7t27Fy9e/MwzzzRv3vy+++4LODWiefPmIS2SsnTp0iDNGjZsGJZVsIMvsRGwY4UzadKkL774ooAGjz32WCSnPwdX8Ful/iUpKemaa66JZMficyAlJCRs37595MiRzZs3v+WWW4I/NFS1alVBCKGF4tNPP33zzTcHbN+/f/+AP58kJCTMmzcvYMvjP7GWLVu2W7duQVpu2rQp+IMhhZCfn1/wO3vr1q3729/+NgYHw5w5cwK2vPPOOyPZsfgcSD8dUePGjQs+NUIQQmFMmDDhj3/8Y5CWZcqUCb524owZMwL+yHHttdce/7/iA94Revfdd4u6nrNmzfr4448LaBCBH3IKF4QB19hs2bJlkDd2hUvcDqSfmj17dsAXHBb1igeCkBJr0KBBAZ9Y69Kly9lnnx2k5fbt2wO+sqd58+Zdu3YtdOcTExMfeOCBgI2nTp0agXoW/M7e2HT48OHJkycHbDxq1KiI3eCN54H0UwGDsCjWixCExIWDBw/2798/YOPgK2eOGTMmYMtnn3220CfWm266qV27dkFarlu3bv78+RGo58KFC6dPn17shkHBC8X9VIsWLQYPHhyxjsXtQPqpgMud7927VxBCIc2YMaPgG3r/ct5553Xo0CFIy9dffz3gq90yMjKC/2P8p6pVqxZ8ovrzzz8f3vfDFeCBBx4o3AvKo2j58uUBLzsSEhLuueeecM1aq1u37rhx40rYQBowYMCjjz4axoV4ateuHaRZEU2TFYTEi0cffTS8LXNycp555pmA23zooYeuuOKKkDqcmpo6efLkgG++3b59+9ixYyNWzNWrV//tb38rdmPg/vvvD/hvhVKlSr399tvHcysyISGhbNmyAwYMWLVq1QUXXFDCBlLlypUfeeSRzZs3jxgx4tRTTz3e+ClVKshOfffdd2F8L6MgJB7Nmzcv4A2f4BeFw4cPD/hwXalSpd54441bbrklYG9POumk999//5xzzgnY/uGHHy6KBR4L8MgjjwR/q0OMWLJkySuvvBI8xiZPnjx48OBC3I1MTk6+9dZbv/zyy2HDhgV5vqOYDqS0tLS+fft++eWXc+fOvemmmwr9UuiHH344SJouWrSo2J+GRo4cmR8pQX7pjYX+xFpNftGxJ9x+UfAf5MJyjEaOHBlwg+edd17AcgW/h9alS5eQDsSbb75Zt27dAjaYlJTUs2fPb7/9Nvg2FyxYEHBJlyAlDb4+5F/+8pdCD8iAM1XCPgZOPPHEzMzMkLr61Vdf3XjjjQHjsHHjxk8++eS2bdt+uoWtW7eWsIE0dOjQn//5/v37p0yZcvPNNwe8z5mQkFC1atXRo0cH7N7vfve7os6p0q4YiIeLwo8//jjI1d6xi8IgPyu+++67Y8eOve222wL24aqrrrriiitmzZr17rvvLl26NDMzMysrKzk5uWrVqk2bNj3vvPOuu+669PT04DuVlZV14403RuUXuyeeeOLmm2+O8Dv8jtOePXt69OjxySefBH/Xa6NGjcaPHz98+PBp06Z9/PHHq1at+uabb7KysnJzc1NTUytXrlynTp0mTZq0bdv2/PPPz8jIKFzHSsBASk1N7dat27Gpips2bfrHP/6xatWqtWvXbtmyZfv27dnZ2Tk5OcnJyWlpaaecckrz5s0vvPDCrl27BryOPHLkSPDnfgUhFOSxxx6bO3dukJaPPvro+eefH6Rlv379WrZsGXy95qSkpMsuuywsS+kfPXr0pptu2rRpU1SKuXPnzuHDhw8aNKh4jYHFixf36tVr/PjxIb3Wp3Llyrfcckvwe5KFUJIGUr169erVqxfG4kyaNCmM77L4b/xGSFz46KOPPvnkkyAtzzvvvIBvaDpw4MCll166fv36yO9O3759Iz/l66eeeeaZH374odgNg4kTJ/bp0yfWehXPA6lgBw8efPzxxyPwQYKQOLooDNgy+IOm33//fceOHVetWhWxvTh69GifPn2ef/756BZz3759Mf56+v/m+eefv/HGG2PteZ+4HUgFe+SRRyLz7wNBSLyYO3duwIvCjh07Bn9t7/bt23/1q199+OGHEdiF/fv39+jRY9SoUbFQz1GjRgV5GCQ2rws7depU8AuHIy9uB9J/88Ybbzz99NOR+SxBiIvC47ooTEhI2Lt370UXXTRw4MCAb78rnKVLl7Zu3frtt9+OkWIePHgweD1jzccff9y8efNJkybFVK/icyD9R6+99lok3+0lCImvi8IFCxaE/aIwISHh6NGjQ4cObdWq1ezZs8Pe7R9++OGuu+76n//5n6j8jFSAV1999fjfPx4tu3fvvvbaazt16rRs2bKi2H52dvZrr70W6l/F+EBatmxZ0b0C+l//wLrrrruuv/76I0eOCEIoTheFx6xdu7Zz587nn3/+9OnTwzKxYevWrQ8++GBGRsaIESOK9CqhcPLy8ords6P/5sMPP2zXrl23bt3mzJkTrpXqvvzyy759+9asWXPAgAGF20LMDqS33nqrQYMGLVq0ePDBBxcvXhzetf1yc3PHjx9/6qmnBl8eNlxMnyC+fPjhhwsWLAiy4saxi8JCLEM8b968efPm1a1b9+qrr+7WrduZZ54ZcLbyv+zcuXPGjBlTpkyZPXt2JP9dXAhvv/320qVL27ZtW3yHRH5+/rRp06ZNm1a/fv0rrrjisssuO/vss5OSkkLayJEjRxYuXDhr1qyZM2euXr06LB2L2YG0evXq1atXDxkypEqVKmf9n3bt2hVuaml+fv6yZcsmT548bty4aP1wm5gAFKVKlSq1bdu2Xbt2jRs3rlOnTnp6+gknnJCamlquXLkjR47k5OTs379/x44dW7Zs2bRp0/Lly5csWfLPf/4zYuto83Ply5dv06bN6aef3rRp0/T09PT09KpVq6akpKSkpCQmJmZlZe3bt2/fvn07d+788ssv16xZs3r16pUrVxb1epgxPpCSkpIaNmyYkZFRv379Bg0a1K9fv0aNGmlpaWlpaeXLly9fvnxSUtLhw4dzcnJ27dq1c+fOzMzMr776avny5QsXLgy4+DgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAECf+HxEdXmmPjlS7AAAAAElFTkSuQmCC"

export function gerarHTMLRecibo(pdf, isOrcamento = false) {
  const { cliente = {}, aparelhos = [], acessorios = [], pagamentos = [], trocas = [], garantias = [] } = pdf

  // Estilos reutilizáveis
  const SEC_H = 'background:#2c2c2c;color:#fff;padding:4px 8px;font-weight:bold;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;'
  const TH_S = 'background:#2c2c2c;color:#fff;padding:5px 6px;text-align:left;font-size:10px;border:1px solid #000;'

  // Linhas de produtos
  const produtosRows = [...aparelhos, ...acessorios].map((p, i) => `
    <tr style="${i % 2 === 1 ? 'background:#f5f5f5;' : ''}">
      <td style="padding:5px 6px;border:1px solid #000;">${p.descricao || ''}</td>
      <td style="padding:5px 6px;border:1px solid #000;text-align:center;width:40px;">${p.qtd || 1}</td>
      <td style="padding:5px 6px;border:1px solid #000;text-align:right;width:110px;">${p.valorUnitario || ''}</td>
      <td style="padding:5px 6px;border:1px solid #000;text-align:right;width:90px;">${p.desconto || '-'}</td>
      <td style="padding:5px 6px;border:1px solid #000;text-align:right;width:110px;">${p.valorTotal || ''}</td>
    </tr>`).join('')

  // Linha de total da tabela de produtos
  const totalProdRow = `
    <tr style="background:#d8d8d8;font-weight:bold;">
      <td style="padding:5px 6px;border:1px solid #000;">Total</td>
      <td style="padding:5px 6px;border:1px solid #000;"></td>
      <td style="padding:5px 6px;border:1px solid #000;text-align:right;">${pdf.totalBruto || ''}</td>
      <td style="padding:5px 6px;border:1px solid #000;text-align:right;">${pdf.totalDesconto && pdf.totalDesconto !== 'R$ 0,00' ? pdf.totalDesconto : 'R$ 0,00'}</td>
      <td style="padding:5px 6px;border:1px solid #000;text-align:right;">${pdf.totalVenda || ''}</td>
    </tr>`

  // Linhas de pagamento
  const pagamentosRows = pagamentos.map((p, i) => `
    <tr style="${i % 2 === 1 ? 'background:#f5f5f5;' : ''}">
      <td style="padding:5px 6px;border:1px solid #000;">${p.forma || ''}</td>
      <td style="padding:5px 6px;border:1px solid #000;">${p.detalhes || ''}</td>
      <td style="padding:5px 6px;border:1px solid #000;text-align:right;width:130px;">${p.valor || ''}</td>
      <td style="padding:5px 6px;border:1px solid #000;text-align:center;width:80px;">${p.parcelas || ''}</td>
    </tr>`).join('')

  const totalPagRow = `
    <tr style="background:#d8d8d8;font-weight:bold;">
      <td colspan="2" style="padding:5px 6px;border:1px solid #000;">Total</td>
      <td style="padding:5px 6px;border:1px solid #000;text-align:right;">${pdf.totalVenda || ''}</td>
      <td style="padding:5px 6px;border:1px solid #000;"></td>
    </tr>`

  // Seção de trocas
  const trocasSection = trocas && trocas.length > 0 ? `
    <div style="margin-bottom:8px;border:1px solid #000;">
      <div style="${SEC_H}">APARELHOS RECEBIDOS EM TROCA</div>
      <table style="width:100%;border-collapse:collapse;font-size:10px;">
        <tr><th style="${TH_S}">Aparelho / Observação</th></tr>
        ${trocas.map(t => `<tr><td style="padding:5px 6px;border:1px solid #000;">${t}</td></tr>`).join('')}
      </table>
    </div>` : ''

  // Seção de observação
  const obsSection = pdf.observacao ? `
    <div style="margin-bottom:8px;border:1px solid #000;">
      <div style="${SEC_H}">OBSERVAÇÃO</div>
      <div style="padding:6px 8px;font-size:10px;white-space:pre-wrap;">${pdf.observacao}</div>
    </div>` : ''

  // Seção de garantias (DADOS ADICIONAIS)
  let dadosAdicionaisSection = ''
  if (!isOrcamento && garantias && garantias.length > 0) {
    const blocos = garantias.map(g => {
      const fimGarantia = calcGarantiaDate(pdf.dataVenda, g.dias)
      const termos = g.termos.map(t => `<p style="margin:2px 0;font-size:10px;">- ${t}</p>`).join('')
      return `
        <p style="font-weight:bold;font-size:10px;margin-bottom:3px;">${g.titulo}</p>
        <p style="font-size:10px;margin-bottom:4px;">Válida até: <strong>${fimGarantia}</strong></p>
        ${termos}`
    }).join('<br/>')
    dadosAdicionaisSection = `
      <div style="margin-bottom:8px;border:1px solid #000;">
        <div style="${SEC_H}">DADOS ADICIONAIS</div>
        <div style="padding:6px 8px;line-height:1.6;">${blocos}</div>
      </div>`
  }

  const titulo = isOrcamento ? 'ORÇAMENTO' : 'RECIBO DE VENDA'
  const subtitulo = isOrcamento
    ? `Orçamento Nº ${pdf.numOrcamento || ''}`
    : pdf.idVenda || ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #000; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { width: 794px; margin: 0 auto; padding: 20px 25px; }
    @media print {
      body { background: #fff !important; }
      .page { padding: 8mm 12mm; width: auto; }
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- CABEÇALHO -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
    <tr>
      <td style="vertical-align:top;width:60px;">
        <img src="${pdf.empresa?.logoHtml || `data:image/png;base64,${LOGO_BASE64}`}" style="width:65px;height:65px;object-fit:contain;" alt="Logo">
      </td>
      <td style="vertical-align:top;padding-left:10px;">
        <div style="font-size:13px;font-weight:bold;">${pdf.empresa?.nome || "Core Distribuidora Eletrônicos"}</div>
        <div style="font-size:9px;color:#333;line-height:1.6;margin-top:3px;">
          ${pdf.empresa?.enderecoLine1 || "Avenida Nápoli 309 Goiânia GO 74367-970 Shopping Plaza D'Oro"}<br>
          ${pdf.empresa?.enderecoLine2 || "Office, sala 309"}<br>
          ${pdf.empresa?.cnpj || pdf.empresa?.telefone ? `CNPJ: ${pdf.empresa.cnpj || "---"} | Telefone: ${pdf.empresa.telefone || "---"}` : "CNPJ: 32.676.141/0001-15 | Telefone: (62) 9613-4005"}
        </div>
      </td>
      <td style="vertical-align:top;text-align:right;white-space:nowrap;">
        <div style="font-size:16px;font-weight:bold;margin-bottom:4px;">${titulo}</div>
        <div style="font-size:10px;">${subtitulo}</div>
        <div style="font-size:10px;">${formatDate(pdf.dataVenda)}</div>
        ${pdf.vendedor ? `<div style="font-size:10px;">VENDEDOR: ${pdf.vendedor}</div>` : ''}
      </td>
    </tr>
  </table>

  <!-- DESTINATÁRIO/REMETENTE -->
  <div style="margin-bottom:8px;border:1px solid #000;">
    <div style="${SEC_H}">DESTINATÁRIO/REMETENTE</div>
    <table style="width:100%;border-collapse:collapse;font-size:10px;">
      <tr>
        <th style="${TH_S};width:30%">Nome/Razão social</th>
        <th style="${TH_S};width:20%">Telefone</th>
        <th style="${TH_S};width:20%">CPF/CNPJ</th>
        <th style="${TH_S};width:30%">E-mail</th>
      </tr>
      <tr>
        <td style="padding:5px 6px;border:1px solid #000;">${cliente.nome || ''}</td>
        <td style="padding:5px 6px;border:1px solid #000;">${cliente.telefone || ''}</td>
        <td style="padding:5px 6px;border:1px solid #000;">${cliente.cpf || ''}</td>
        <td style="padding:5px 6px;border:1px solid #000;">${cliente.email || ''}</td>
      </tr>
      <tr>
        <th style="${TH_S};width:40%">Endereço</th>
        <th style="${TH_S};width:15%">CEP</th>
        <th style="${TH_S};width:25%">Cidade</th>
        <th style="${TH_S};width:20%">Estado</th>
      </tr>
      <tr>
        <td style="padding:5px 6px;border:1px solid #000;">${cliente.endereco || ''}</td>
        <td style="padding:5px 6px;border:1px solid #000;">${cliente.cep || ''}</td>
        <td style="padding:5px 6px;border:1px solid #000;">${cliente.cidade || ''}</td>
        <td style="padding:5px 6px;border:1px solid #000;">${cliente.estado || 'GO'}</td>
      </tr>
    </table>
  </div>

  <!-- DADOS DO PRODUTO -->
  <div style="margin-bottom:8px;border:1px solid #000;">
    <div style="${SEC_H}">DADOS DO PRODUTO</div>
    <table style="width:100%;border-collapse:collapse;font-size:10px;">
      <tr>
        <th style="${TH_S}">Produto</th>
        <th style="${TH_S};width:40px;text-align:center;">Qtd</th>
        <th style="${TH_S};width:110px;text-align:right;">Valor Unitário</th>
        <th style="${TH_S};width:90px;text-align:right;">Desconto</th>
        <th style="${TH_S};width:110px;text-align:right;">Valor Total</th>
      </tr>
      ${produtosRows}
      ${totalProdRow}
    </table>
  </div>

  <!-- PAGAMENTO -->
  <div style="margin-bottom:8px;border:1px solid #000;">
    <div style="${SEC_H}">PAGAMENTO</div>
    <table style="width:100%;border-collapse:collapse;font-size:10px;">
      <tr>
        <th style="${TH_S}">Forma de Pagamento</th>
        <th style="${TH_S}">Detalhes</th>
        <th style="${TH_S};width:130px;text-align:right;">Valor Pago</th>
        <th style="${TH_S};width:80px;text-align:center;">Parcelas</th>
      </tr>
      ${pagamentosRows}
      ${totalPagRow}
    </table>
  </div>

  ${trocasSection}
  ${obsSection}
  ${dadosAdicionaisSection}

  <!-- ASSINATURAS -->
  <table style="width:100%;margin-top:30px;">
    <tr>
      <td style="width:50%;text-align:center;padding:0 20px;">
        <div style="border-top:1px solid #333;padding-top:6px;">
          <div style="font-size:10px;color:#555;">Assinatura do cliente</div>
          <div style="font-weight:bold;font-size:11px;margin-top:2px;">${cliente.nome || ''}</div>
        </div>
      </td>
      <td style="width:50%;text-align:center;padding:0 20px;">
        <div style="border-top:1px solid #333;padding-top:6px;">
          <div style="font-size:10px;color:#555;">Assinatura do vendedor</div>
          <div style="font-weight:bold;font-size:11px;margin-top:2px;">${pdf.empresa?.nome || "Core Distribuidora Eletrônicos"}</div>
        </div>
      </td>
    </tr>
  </table>

  <!-- RODAPÉ -->
  <div style="text-align:center;margin-top:18px;font-weight:bold;font-size:12px;letter-spacing:1px;">
    OBRIGADO PELA PREFERÊNCIA.
  </div>

</div>
</body>
</html>`
}

export function gerarPDF(htmlContent, nomeArquivo) {
  // Injeta script de impressão automática no HTML
  const htmlWithPrint = htmlContent.replace(
    '</body>',
    `<script>
      window.onload = function() {
        setTimeout(function() {
          document.title = '${(nomeArquivo || 'documento').replace(/'/g, "\\'")}';
          window.print();
        }, 400);
      };
    <\/script></body>`
  )
  const blob = new Blob([htmlWithPrint], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const tab = window.open(url, '_blank')
  if (!tab) {
    alert('Permita popups neste site para gerar o PDF. Clique no ícone de bloqueio na barra de endereço e permita popups.')
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
