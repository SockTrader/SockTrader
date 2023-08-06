<p align="center"><img width="160" height="160" src="https://raw.githubusercontent.com/SockTrader/SockTrader/master/docs/assets/socktrader_logo.png" alt="SockTrader logo" /></p>

<h1 align="center">@socktrader/indicators</h1>

<p align="center"><b>Join the community <a href="https://join.slack.com/t/socktrader/shared_invite/zt-12ncj65l3-T7cacrk7~cEacjZUyxnamA"><img valign="middle" src="https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack" alt="Slack"></a></b></p>

## What is "@socktrader/indicators"?

This independent package contains various utility functions to support risk, performance, quantitative and technical analysis. `@socktrader/indicators` is part of the [SockTrader monorepo project](https://github.com/SockTrader/SockTrader) but can be used in any project without depending on the rest of the SockTrader project.

# Quickstart

1. Install library: `npm install @socktrader/indicators`
2. Use library `activeReturn([0.003], [0.04], 12)`

## Indicators

#### Technical indicators

`@socktrader/indicators` re-exports all indicators from [technicalindicators](https://www.npmjs.com/package/technicalindicators).
Check the [technicalindicators docs](https://www.npmjs.com/package/technicalindicators#available-indicators) for more API details.

#### Performance metrics

```
    const x = [0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039]
    const z = [0.04, -0.022, 0.043, 0.028, -0.078, -0.011, 0.033, -0.049, 0.09, 0.087]

    activeReturn(x, z, 12)
    // 0.041978811047168385

    annualReturn(x, 12)
    // 0.2338146820656939

    compoundAnnualGrowthRate(x, x.length / 12)
    // 0.22938756017127182

    internalRateOfReturn([250000, 25000, -10000, -285000])
    // 0.024712563094781776

    mdietz(1200, 1000, [10, 50, 35, 20], [15, 38, 46, 79], 90)
    // 0.0804331826306382

    percpos(x)
    // 0.8

    rateOfReturn(x)
    // 0.18779277315203946

    timeWeightedReturn([250000, 255000, 257000, 288000, 293000, 285000], [0, 0, 25000, 0, -10000, 0])
    // 0.07564769566198049

```

#### Risk metrics

```
    const x = [0.003, 0.026, 0.015, -0.009, 0.014, 0.024, 0.015, 0.066, -0.014, 0.039]
    const y = [-0.005, 0.081, 0.04, -0.037, -0.061, 0.058, -0.049, -0.021, 0.062, 0.058]
    const z = [0.04, -0.022, 0.043, 0.028, -0.078, -0.011, 0.033, -0.049, 0.09, 0.087]

    adjustedSharpeRatio(x, 0.02 / 12)
    // 0.7481337144481773

    annualAdjustedSharpeRatio(x, 0.02, 12, Mode.geometric)
    // 3.3767236091658313

    annualRisk(x, 12)
    // 0.08047276972160623

    avgDrawdown(x)
    // 0.01150000000000001

    burkeRatio(x, 0, 12)
    // 14.048562698619559

    calmarRatio(x, 0, 12)
    // 16.70104871897814

    continuousDrawdown(x)
    // [0.009000000000000008, 0.014000000000000012]

    downsidePotential(x, 0.1 / 100)
    // 0.0024999999999999996

    downsideRisk(x, 0.1 / 100)
    // 0.005700877125495689

    drawdown(x)
    // {
    //    'dd': [0, 0, 0, 0.00900000000000004, 0, 0, 0, 0, 0.013999999999999995, 0],
    //    'ddrecov': [0, 0, 0, 4, 0, 0, 0, 0, 9, 0],
    //    'maxdd': 0.013999999999999995,
    //    'maxddrecov': [8, 9]
    // }

    histcondvar(x)
    // 0.014

    histvar(x)
    // 0.013999999999999999

    informationRatio(x, y)
    // 0.09369148584852913

    jensenAlpha(x, y)
    // 0.01760907323602524

    m2sortino(x, y, 0, 0, 12)
    // 0.504144074388577

    martinRatio(x, 0, 12)
    // 44.42545597931942

    modigliani(x, y)
    // 0.040694064858387835

    monteCarloValueAtRisk(x, 0.95, 1, 0, 1, 10000)
    // random: 0 < x < 1

    omegaRatio(x)
    // 8.782608695652174

    painIndex(x)
    // 0.0023000000000000034

    painRatio(x, 0, 12)
    // 101.04495520047377

    parametricConditionalValueAtRisk(mean(x), std(x))
    // 0.030017825479120894

    parametricValueAtRisk([0, 0, 0], [1, 2, 3])
    // [1.6448536127562643, 3.2897072255125286, 4.934560838268792]

    sharpeRatio(x, 0.02 / 12)
    // 0.6987943426529188

    sortino(x, 0.02 / 12)
    // 3.0843795993743215

    sterlingRatio(x, 0, 12)
    // 16.70104871897812

    trackingError(x, z)
    // 0.06843618276256436

    treynorRatio(x, z, 0.01 / 12)
    // -0.09568702060685172

    ulcerIndex(x)
    // 0.005263078946776312

    upsidePotential(x, 0.1 / 100)
    // 0.0194

```
