class Segment
{
    constructor(x,y,parent)
    {
        this.parent = parent; //Statek do którego należy segment
        this.field = parent.field; //Pole do którego należy segment
        this.dead = false; //Czy segment został zestrzelony
        this.x = x; //Położenie segmentu
        this.y = y;
    }

    check(field) //Czy dany segment może być umieszczony w danej pozycji
    {
        if(this.x < 0 || this.y < 0 || this.x > 9 || this.y > 9)
            return false;
        for(let i=-1;i<=1;i++)
            for(let j=-1;j<=1;j++)
                if(!(!field[this.x+i] || !field[this.x+i][this.y+j]) && field[this.x+i][this.y+j] instanceof Segment && field[this.x+i][this.y+j].parent != this.parent)
                    return false;
        return true;
    }

    getBoundaries(invalidCells) //Pola wokół segmentu, na których nie można umieścić innych statków
    {
        if(this.parent.placing)
        {
            for(let i=-1;i<=1;i++)
                for(let j=-1;j<=1;j++)
                    if(playerField[this.x+i] && playerField[this.x+i][this.y+j]) 
                    {
                        if(playerField[this.x+i][this.y+j] instanceof Segment && playerField[this.x+i][this.y+j].parent != this.parent)
                        {
                            let invalidCell = {x:this.x+i,y:this.y+j};
                            if(!invalidCells.includes(invalidCell))
                                invalidCells.push(invalidCell);
                        }
                    }
        }
    }

    draw(c) //Segment jest rysowany na różne sposoby w zależności od tego, czy przylegają do niego inne segmenty.
    {
        c.strokeStyle = 'black';
        if(this.parent.placing)
            c.fillStyle = "rgba(100,100,100,0)";
        else if(this.parent.isDead())
            c.fillStyle = "rgba(80,80,100)";
        else
            c.fillStyle = "grey";
        c.lineWidth = scale*0.02;
        if(this.parent.orientation == 'x')
        {
            if(this.field[this.x+1] && this.field[this.y] && this.field[this.x+1][this.y] instanceof Segment)
            {
                c.fillRect(this.x*scale+scale/2-1,this.y*scale+scale*0.2,scale/2+2,scale*0.6);
                c.beginPath();
                c.moveTo(this.x*scale+scale/2,this.y*scale+scale*0.2);
                c.lineTo(this.x*scale+scale,this.y*scale+scale*0.2);
                c.stroke();
                c.beginPath();
                c.moveTo(this.x*scale+scale/2,this.y*scale+scale*0.8);
                c.lineTo(this.x*scale+scale,this.y*scale+scale*0.8);
                c.stroke();
            }
            else
            {
                c.beginPath();
                c.arc(this.x*scale+scale/2,this.y*scale+scale/2,scale*0.3,Math.PI*3/2,Math.PI/2);
                c.fill();
                c.stroke();
            }
            if(this.field[this.x-1] && this.field[this.y] && this.field[this.x-1][this.y] instanceof Segment)
            {
                c.fillRect(this.x*scale-1,this.y*scale+scale*0.2,scale/2+2,scale*0.6);
                c.beginPath();
                c.moveTo(this.x*scale,this.y*scale+scale*0.2);
                c.lineTo(this.x*scale+scale/2,this.y*scale+scale*0.2);
                c.stroke();
                c.beginPath();
                c.moveTo(this.x*scale,this.y*scale+scale*0.8);
                c.lineTo(this.x*scale+scale/2,this.y*scale+scale*0.8);
                c.stroke();
            }
            else
            {
                c.beginPath();
                c.arc(this.x*scale+scale/2,this.y*scale+scale/2,scale*0.3,Math.PI/2,Math.PI*3/2);
                c.fill();
                c.stroke();
            }
        }
        else
        {
            if(this.field[this.x] && this.field[this.y+1] && this.field[this.x][this.y+1] instanceof Segment)
            {
                c.fillRect(this.x*scale+scale*0.2,this.y*scale-1+scale/2,scale*0.6,scale/2+2);
                c.beginPath();
                c.moveTo(this.x*scale+scale*0.2,this.y*scale+scale/2);
                c.lineTo(this.x*scale+scale*0.2,this.y*scale+scale);
                c.stroke();
                c.beginPath();
                c.moveTo(this.x*scale+scale*0.8,this.y*scale+scale/2);
                c.lineTo(this.x*scale+scale*0.8,this.y*scale+scale);
                c.stroke();
            }
            else
            {
                c.beginPath();
                c.arc(this.x*scale+scale/2,this.y*scale+scale/2,scale*0.3,Math.PI*2,Math.PI);
                c.fill();
                c.stroke();
            }
            if(this.field[this.x] && this.field[this.y-1] && this.field[this.x][this.y-1] instanceof Segment)
            {
                c.fillRect(this.x*scale+scale*0.2,this.y*scale-1,scale*0.6,scale/2+2);
                c.beginPath();
                c.moveTo(this.x*scale+scale*0.2,this.y*scale);
                c.lineTo(this.x*scale+scale*0.2,this.y*scale+scale/2);
                c.stroke();
                c.beginPath();
                c.moveTo(this.x*scale+scale*0.8,this.y*scale);
                c.lineTo(this.x*scale+scale*0.8,this.y*scale+scale/2);
                c.stroke();
            }
            else
            {
                c.beginPath();
                c.arc(this.x*scale+scale/2,this.y*scale+scale/2,scale*0.3,Math.PI,Math.PI*2);
                c.fill();
                c.stroke();
            }
        }
        c.beginPath();
        c.arc(this.x*scale+scale/2,this.y*scale+scale/2,scale*0.2,0,Math.PI*2);
        if(this.dead)
        {
            c.fillStyle = 'red';
            c.fill();
        }
        c.stroke();
    }
}