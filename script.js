var scale = 1; //Wielkość pojedynczej komórki
var playerField = []; //Pole gracza
var enemyField = []; //Pole gracza komputerowego
var ghostField = []; //Pole-widmo do sprawdzania gdzie może zostać umieszczony statek
var phase = 'setup'; //Faza gry ('setup' - ustawianie statków, lub 'game' - gra)
var shipsToPlace = [5,4,4,3,3,2,2]; //Rozmiary statków, które gracze umieszczają na planszy
var shipNo = 0; //Numer aktualnie umieszczanego statku (indeks tablicy shipsToPlace)
var turn = 0; //Tura (0 - gracz, 1 - komputer)
var scrollCD = 0; //Cooldown scrolla. Minimalna ilość czasu który musi upłynąć przed zarejestrowaniem kolejnego eventu scroll.

for(let i=0;i<10;i++)
{
    playerField.push([1,1,1,1,1,1,1,1,1,1]);
    enemyField.push([1,1,1,1,1,1,1,1,1,1]);
    ghostField.push([1,1,1,1,1,1,1,1,1,1]);
}

var placedShip = new Ship(ghostField,0,0,shipsToPlace[shipNo],'x'); //Aktualnie umieszczany statek

window.addEventListener('load',_=>
{
    window.canvas1 = document.getElementById("player-field");
    window.canvas2 = document.getElementById("enemy-field");
    window.c1 = canvas1.getContext('2d');
    window.c2 = canvas2.getContext('2d');

    window.addEventListener('resize',resize);
    enemySetup();
    resize();
    document.getElementById("player-field").style.boxShadow = `0 0 0 ${scale*0.04}px #00FF88`;
    document.getElementById("player-field").style.cursor = 'pointer';

    canvas1.addEventListener('mousemove',e=> //Umieszczanie statku na planszy
    {
        if(phase != 'setup')
            return;
        let x = parseInt(e.offsetX/scale);
        let y = parseInt(e.offsetY/scale);
        if((x != placedShip.x || y != placedShip.y) && !(placedShip.orientation == 'x' && x+placedShip.size-1>9 || placedShip.orientation == 'y' && y+placedShip.size-1>9) )
        {   
            ghostField = [];
            for(let i=0;i<10;i++)
                ghostField.push([1,1,1,1,1,1,1,1,1,1]);
            placedShip = new Ship(ghostField,x,y,placedShip.size,placedShip.orientation);
        }
        draw();
        placedShip.draw(c1);
        placedShip.drawBoundaries(c1);
        c1.fillStyle = "rgba(0,255,100,0.3)";
        c1.fillRect(x*scale,y*scale,scale,scale);
    });

    canvas1.addEventListener('mousewheel',e=> //Zmiana orientacji umieszczanego statku
    {
        if(Date.now() - scrollCD < 100)
            return;
        if(phase != 'setup')
            return;
        if(!(placedShip.orientation == 'y' && placedShip.x+placedShip.size-1>9 || placedShip.orientation == 'x' && placedShip.y+placedShip.size-1>9))
        {
            ghostField = [];
            for(let i=0;i<10;i++)
                ghostField.push([1,1,1,1,1,1,1,1,1,1]);
            placedShip = new Ship(ghostField,placedShip.x,placedShip.y,placedShip.size,(placedShip.orientation=='x')?'y':'x');
        }
        scrollCD = Date.now();
        draw();
        placedShip.draw(c1);
        placedShip.drawBoundaries(c1);
        c1.fillStyle = "rgba(0,255,100,0.3)";
        let x = parseInt(e.offsetX/scale);
        let y = parseInt(e.offsetY/scale);
        c1.fillRect(x*scale,y*scale,scale,scale);
    });

    canvas1.addEventListener('click',e=> //Umieszczanie statku na planszy
    {
        if(phase != 'setup')
            return;
        if(placedShip.isValid(playerField))
        {
            new Ship(playerField,placedShip.x,placedShip.y,placedShip.size,placedShip.orientation,false);
            shipNo++;
            if(shipNo >= shipsToPlace.length)
            {
                phase = 'game';
                placedShip = null;
                document.getElementById("player-field").style.boxShadow = "0 0 0 2px black";
                document.getElementById("player-field").style.cursor = 'default';
                document.getElementById("enemy-field").style.boxShadow = `0 0 0 ${scale*0.04}px #00FF88`;
                document.getElementById("enemy-field").style.cursor = 'pointer';
            }
            else
                placedShip = new Ship(ghostField,0,0,shipsToPlace[shipNo],'x');
        }
        draw();
    });

    canvas2.addEventListener('mousemove',e=>
    {
        if(phase != 'game' || turn != 0)
            return;
        draw();
        c2.fillStyle = "rgba(0,255,100,0.3)";
        let x = parseInt(e.offsetX/scale);
        let y = parseInt(e.offsetY/scale);
        c2.fillRect(x*scale,y*scale,scale,scale);
    });

    canvas2.addEventListener('click',e=> //Oddawanie strzałów
    {
        if(phase != 'game' || turn != 0)
            return;
        let x = parseInt(e.offsetX/scale);
        let y = parseInt(e.offsetY/scale);
        if(enemyField[x][y] instanceof Segment)
        {
            enemyField[x][y].dead = true;
            draw();
            finishCheck();
        }
        else
        {
            enemyField[x][y] = 2;
            turn = 1;
            setTimeout(Enemy.move,700);
            document.getElementById("player-field").style.boxShadow = `0 0 0 ${scale*0.04}px red`;
            document.getElementById("enemy-field").style.boxShadow = "0 0 0 2px black";
            document.getElementById("enemy-field").style.cursor = 'default';
            
        }
        draw();
    });
});

function enemySetup()
{
    shipsToPlace.forEach(size =>
    {
        let x,y,orientation,tmpShip;
        do
        {
            orientation = ['x','y'][Math.floor(Math.random()*2)];
            if(orientation == 'x')
            {
                x = Math.floor(Math.random()*(10-size));
                y = Math.floor(Math.random()*10);
            }
            else
            {
                x = Math.floor(Math.random()*10);
                y = Math.floor(Math.random()*(10-size));
            }
            ghostField = [];
            for(let i=0;i<10;i++)
                ghostField.push([1,1,1,1,1,1,1,1,1,1]);
            tmpShip = new Ship(ghostField,x,y,size,orientation);
        }
        while(!tmpShip.isValid(enemyField));
        new Ship(enemyField,x,y,size,orientation,false);
    });
}

function resize()    
{
    if(innerWidth>innerHeight)
        if(innerHeight<innerWidth/2)
            canvas1.width = canvas1.height = canvas2.width = canvas2.height = innerHeight-23;
        else
            canvas1.width = canvas1.height = canvas2.width = canvas2.height = innerWidth/2-23;
    else
        if(innerWidth<innerHeight/2)
            canvas1.width = canvas1.height = canvas2.width = canvas2.height = innerWidth-23;
        else
            canvas1.width = canvas1.height = canvas2.width = canvas2.height = innerHeight/2-23;
    scale = canvas1.width/10;
    draw();
}

function drawField(c)
{
    c.lineWidth = 1;
    c.fillStyle = "#88BBFF";
    c.strokeStyle = "black";
    c.fillRect(0,0,canvas1.width,canvas1.height);
    for(let i=0;i<canvas1.width;i+=scale)
    {
        c.beginPath();
        c.moveTo(0,i);
        c.lineTo(canvas1.width,i);
        c.stroke();
        c.beginPath();
        c.moveTo(i,0);
        c.lineTo(i,canvas1.width);
        c.stroke();
    }
}

function drawShips(reveal)
{
    for(let i=0;i<10;i++)
        for(let j=0;j<10;j++)
        {
            if(playerField[i][j] instanceof Segment)
            {
                playerField[i][j].draw(c1);
            }
            else if(playerField[i][j] == 2)
            {
                c1.beginPath();
                c1.fillStyle = 'white';
                c1.strokeStyle = "black";
                c1.arc(i*scale+scale/2,j*scale+scale/2,scale*0.2,0,Math.PI*2);
                c1.fill();
                c1.stroke();
            }
        }

    for(let i=0;i<10;i++)
        for(let j=0;j<10;j++)
        {
            c1.lineWidth = scale*0.02;
            c2.lineWidth = scale*0.02;
            if(enemyField[i][j] instanceof Segment)
            {
                if(enemyField[i][j].parent.isDead() || reveal)
                    enemyField[i][j].draw(c2);
                else if(enemyField[i][j].dead)
                {
                    c2.beginPath();
                    c2.fillStyle = 'red';
                    c2.strokeStyle = "black";
                    c2.arc(i*scale+scale/2,j*scale+scale/2,scale*0.2,0,Math.PI*2);
                    c2.fill();
                    c2.stroke();
                }
            }
            else if(enemyField[i][j] == 2)
            {
                c2.beginPath();
                c2.fillStyle = 'white';
                c2.strokeStyle = "black";
                c2.arc(i*scale+scale/2,j*scale+scale/2,scale*0.2,0,Math.PI*2);
                c2.fill();
                c2.stroke();
            }
        }
}

function finishCheck()
{
    let playerSegments = 0;
    let enemySegments = 0;
    for(let i=0;i<10;i++)
        for(let j=0;j<10;j++)
        {
            if(playerField[i][j] instanceof Segment && !playerField[i][j].dead)
                playerSegments++;
            if(enemyField[i][j] instanceof Segment && !enemyField[i][j].dead)
                enemySegments++;
        }
    if(playerSegments == 0 || enemySegments == 0)
    {
        phase = 'end';
        if(playerSegments == 0)
            setTimeout(_=>alert("Koniec gry! Wygrywa gracz komputerowy!"),100);
        if(enemySegments == 0)
            setTimeout(_=>alert("Koniec gry! Wygrywa gracz ludzki!"),100);
        drawShips(true);
    }
}

function draw()
{
    drawField(c1);
    drawField(c2);
    drawShips();
}