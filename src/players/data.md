# Data to collect

``` typescript
type TStandardStats = {
    season: string
    age: number
    tm: string
    lg: string
    pos: string
    g: number
    gs: number
    mp: number
    fg: number
    fga: number
    fgPct: number
    thrPt: number
    thrAtmp: number
    thrPct: number
    twPt: number
    twAtmp: number
    twPct: number
    efgPct: number
    ft: number
    fta: number
    ftPct: number
    orb: number
    drb: number
    trb: number
    ast: number
    blk: number
    tov: number
    pf: number
    pts: number
}

type TAdvancedStats = {
    season: string
    age: number
    tm: string
    lg: string
    pos: string
    g: number
    mp: number
    per: number
    tsPct: number
    thrAtpR: number
    ftr: number
    orbPct: number
    drebPct: number
    astPct: number
    stlPct: number
    blkPct: number
    tovPct: number
    usgPct: number
    ows: number
    dws: number
    ws: number
    ws48: number
    obpm: number
    dbpm: number
    bmp: number
    vorp: number
}

type TShootingStats = {
    season: string
    age: number
    tm: string
    lg: string
    pos: string
    g: number
    mp: number
    fgPct: number
    dist: number
    pctTwoPtFga: number
    pctThrPtFga: number
    fgaPctByDist: {
        [key: string]: number
    }
    fgPctByDist: {
        [key: string]: number
    }
    twoPtFgs: {
        pctAst: number
        dunks: {
            pctAtmp: number
            dunkFgm: number
        }
    }
    thrPtFgs: {
        pctAst: number
        corner: {
            pctAtmp: number
            thrPct: number
        }
        heaves: {
            att: number
            md: number
        }
    }
}

type TPlayByPlay = {
    season: string
    age: number
    tm: string
    lg: string
    pos: string
    g: number
    mp: number
    posEstimate: {
        pg: number
        sg: number
        sf: number
        pf: number
        c: number
    }
    plusMinusPer100: {
        onCourt: number
        onOff: number
    }
    turnovers: {
        badPass: number
        lostBall: number
    }
    foulsCommited: {
        shooting: number
        offBall: number
    }
    foulsDrawn: {
        shooting: number
        offBall: number
    }
    misc: {
        pointsFromAst: number
        and1: number
        bfga: number
    }
}

type TGameHighs = {
    season: string
    age: number
    tm: string
    lg: string
    mp: string
    fg: number
    fga: number
    thrPt: number
    thrPtA: number
    twoPt: number
    twoPtA: number
    ft: number
    ftA: number
    orb: number
    drb: number
    trb: number
    ast: number
    stl: number
    tov: number
    pf: number
    pts: number
    gmSc: number
}

interface IPer100 extends TStandardStats {
    ortg: number
    drtg: number
}

type TSalary = {
    season: string
    team: string
    lg: string
    salary: number
}

type TPlayerStats = {
    accolades: string[]
    bio: {
        nicknames: string[]
        born: {
            date: Date
            location: string
            age: number
        }
        education: string
    }
    debut: Date
    draft: {
        team: string
        position: number
        year: number
    }
    experience: number
    height: string
    positions: string[]
    shootingHand: string
    stats: {
        playoffs: {
            shooting: {
                [key: string]: TShootingStats
            }
            advanced: {
                [key: string]: TAdvancedStats
            }
            per100: {
                [key: string]: IPer100
            }
            per36: {
                [key: string]: TStandardStats
            }
            perGame: {
                [key: string]: TStandardStats
            }
            totals: {
                [key: string]: TStandardStats
            }
            playByPlay: {
                [key: string]: TPlayByPlay
            }
            gameHighs: {
                [key: string]: TGameHighs
            }
        }
        season: {
            gameHighs: {
                [key: string]: TGameHighs
            }
            playByPlay: {
                [key: string]: TPlayByPlay
            }
            shooting: {
                [key: string]: TShootingStats
            }
            advanced: {
                [key: string]: TAdvancedStats
            }
            per100: {
                [key: string]: IPer100
            }
            per36: {
                [key: string]: TStandardStats
            }
            perGame: {
                [key: string]: TStandardStats
            }
            totals: {
                [key: string]: TStandardStats
            }
        }
        allStar: {
            [key: string]: TStandardStats
        }
    }
    team: string
    weight: string
    salaries: {
        [key: string]: TSalary
    }
    contract: {
        team: string
        salary: {
            [key: string]: number
        }
    }
}

```

# Steps

1. App method takes player's full name as a parameter
2. Parser method parses first character of player name
3. Query method navigates to page /players/**output from previous method**
4. DOM inspector method either finds exact player match or no-match
5. A: Return empty object or falsy value
5. B: Query method navigates to page /players/**output from previous method**
6. DOM Parser returns player statistics JSON


