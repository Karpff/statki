class Enemy
{
    static hit = null; //Współrzędne ostatniego trafionego strzału wykonanego losowo.
    static ship = null; //Statek, w który ostatnio trafiono.
    static orientation = null; //Orientacja statku w który trafiono (z początku nieznana)
    static direction = null; //Kierunek ostrzału statku, w który trafiono
    static step = 0; //Który z kolei strzał oddawany jest w tym samym kierunku w ten sam statek
    static tries = 10; //Maksymalna ilość prób wykonania lepszego strzału przed zmianą tolerancji
    static tolerance = 0; //Tolerancja sąsiadów - Maksymalna ilość wcześniejszych strzałów, które oddano wokół danego pola, która może zostać uznana za dobry strzał.

    static move()
    {
        if(Enemy.hit && playerField[Enemy.hit.x][Enemy.hit.y].parent.isDead()) //Jeśli poprzedni strzał zniszczył statek
        {
            Enemy.hit = null;
            Enemy.orientation = null;
            Enemy.direction = null;
            Enemy.step = 0;
        }
        if(Enemy.hit && !Enemy.orientation) //Jeśli poprzednim strzałem trafiono statek, ale nieznana jest jego orientacja
        {
            let uncheckedSides = [];
            if(!(Enemy.hit.x+1 > 9) && !Enemy.alreadyShot(Enemy.hit.x+1,Enemy.hit.y)) uncheckedSides.push({x:Enemy.hit.x+1,y:Enemy.hit.y,orientation:'x'});
            if(!(Enemy.hit.x-1 < 0) && !Enemy.alreadyShot(Enemy.hit.x-1,Enemy.hit.y)) uncheckedSides.push({x:Enemy.hit.x-1,y:Enemy.hit.y,orientation:'x'});
            if(!(Enemy.hit.y+1 > 9) && !Enemy.alreadyShot(Enemy.hit.x,Enemy.hit.y+1)) uncheckedSides.push({x:Enemy.hit.x,y:Enemy.hit.y+1,orientation:'y'});
            if(!(Enemy.hit.y-1 < 0) && !Enemy.alreadyShot(Enemy.hit.x,Enemy.hit.y-1)) uncheckedSides.push({x:Enemy.hit.x,y:Enemy.hit.y-1,orientation:'y'});
            let toCheck = uncheckedSides[Math.floor(Math.random()*uncheckedSides.length)];
            if(Enemy.shoot(toCheck.x,toCheck.y))
                Enemy.orientation = toCheck.orientation;
            if(toCheck.x != Enemy.hit.x)
                Enemy.direction = toCheck.x - Enemy.hit.x;
            else if(toCheck.y != Enemy.hit.y)
                Enemy.direction = toCheck.y - Enemy.hit.y;
            Enemy.step = 2*Enemy.direction;
            
        }
        else if(Enemy.hit && Enemy.orientation) //Jeśli znana jest orientacja ostrzeliwanego statku
        {
            if(Enemy.orientation == 'x')
            {
                if(!Enemy.isValidShot(Enemy.hit.x+Enemy.step,Enemy.hit.y))
                {
                    Enemy.direction*=-1;
                    Enemy.step=Enemy.direction;
                }
                if(!Enemy.shoot(Enemy.hit.x+Enemy.step,Enemy.hit.y))
                {
                    Enemy.direction*=-1;
                    Enemy.step=Enemy.direction;
                }
                else
                    Enemy.step+=Enemy.direction;
            }
            else if(Enemy.orientation == 'y')
            {
                if(!Enemy.isValidShot(Enemy.hit.x,Enemy.hit.y+Enemy.step))
                {
                    Enemy.direction*=-1;
                    Enemy.step=Enemy.direction;
                }
                if(!Enemy.shoot(Enemy.hit.x,Enemy.hit.y+Enemy.step))
                {
                    Enemy.direction*=-1;
                    Enemy.step=Enemy.direction;
                }
                else
                    Enemy.step+=Enemy.direction;
            }
        }
        else //Jeśli nie znane jest położenie, ani orientacja statku - strzał oddawany losowo
        {
            let x,y;
            do
            {
                x = Math.floor(Math.random()*10);
                y = Math.floor(Math.random()*10);
                if(Enemy.isValidShot(x,y) && !Enemy.isGoodShot(x,y))
                {
                    Enemy.tries--;
                    if(Enemy.tries <= 0)
                    {
                        Enemy.tries == 0;
                        Enemy.tolerance++;
                    }
                }
            }
            while(!Enemy.isValidShot(x,y) || !Enemy.isGoodShot(x,y) && Enemy.tries>0); //Jeśli strzał jest niepoprawny, lub "słaby", to losowane są nowe współrzędne
            if(Enemy.shoot(x,y))
            {
                Enemy.hit = {x:x,y:y};
                Enemy.ship = playerField[x][y];
            }
        }
    }

    static isGoodShot(x,y) //Czy strzał jest "dobry" - Ilość wcześniej oddanych strzałów w jego pobliże jest mniejsza niż wartość tolerowana
    {
        if(Enemy.neighbours(x,y) > Enemy.tolerance)
            return false;
        else
            return true;
    }

    static isValidShot(x,y) //Czy strzał jest poprawny - Nie strzelono wcześniej w to samo miejsce, nie strzelamy w pobliże zatopionego statku, ani w miejsce w którym nie zmieści się nawet dwumasztowiec
    {
        if(x < 0 || x > 9 || y < 0 || y > 9 || Enemy.alreadyShot(x,y) || Enemy.neighbours(x,y) == 4)
            return false;
        for(let i=-1;i<=1;i++)
            for(let j=-1;j<=1;j++)
                if(playerField[x+i] && playerField[x+i][y+j] && playerField[x+i][y+j] instanceof Segment && playerField[x+i][y+j].parent.isDead())
                    return false;
        return true;
    }

    static alreadyShot(x,y) //Czy juz wcześniej strzelano w dane pole
    {
        return (playerField[x][y] instanceof Segment && playerField[x][y].dead || playerField[x][y] == 2);
    }

    static neighbours(x,y) //Ilość strzałów oddanych wcześniej w pobliże danych współrzędnych
    {
        let neighbours = 0;
        if(playerField[x+1] && playerField[x+1][y] && (playerField[x+1][y] instanceof Segment && playerField[x+1][y].dead && playerField[x+1][y].parent != Enemy.ship || playerField[x+1][y] == 2))
            neighbours++;
        if(playerField[x-1] && playerField[x-1][y] && (playerField[x-1][y] instanceof Segment && playerField[x-1][y].dead && playerField[x-1][y].parent != Enemy.ship || playerField[x-1][y] == 2))
            neighbours++;
        if(playerField[x] && playerField[x][y+1] && (playerField[x][y+1] instanceof Segment && playerField[x][y+1].dead && playerField[x][y+1].parent != Enemy.ship || playerField[x][y+1] == 2))
            neighbours++;
        if(playerField[x] && playerField[x][y-1] && (playerField[x][y-1] instanceof Segment && playerField[x][y-1].dead && playerField[x][y-1].parent != Enemy.ship || playerField[x][y-1] == 2))
            neighbours++;
        return neighbours;
    }

    static shoot(x,y) //Strzał
    {
        Enemy.tries = 10;
        Enemy.tolerance = 0;
        if(playerField[x][y] instanceof Segment)
        {
            playerField[x][y].dead = true;
            draw();
            finishCheck();
            if(phase == 'game')setTimeout(Enemy.move,700);
            return true;
        }
        else
        {
            playerField[x][y] = 2;
            turn = 0;
            document.getElementById("player-field").style.boxShadow = "0 0 0 2px black";
            document.getElementById("enemy-field").style.boxShadow = `0 0 0 ${scale*0.04}px #00FF88`;
            document.getElementById("enemy-field").style.cursor = 'pointer';
            draw();
            finishCheck();
            return false;
        }
    }
}