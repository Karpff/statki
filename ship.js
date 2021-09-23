class Ship
{
    constructor(field,x,y,size,orientation,placing=true)
    {
        this.x = x; //Położenie statku (lewy górny róg)
        this.y = y;
        this.size = size; //Ilość masztów statku
        this.field = field; //Pole, do którego należy statek (gracza lub komputera)
        this.orientation = orientation; //Orientacja statku - pozioma lub pionowa.
        this.segments = []; //Tablica segmentów statku.
        if(orientation == 'x')
            for(let i=0;i<size;i++)
            {
                let seg = new Segment(x+i,y,this)
                this.segments.push(seg);
                this.field[x+i][y] = seg;
            }
        else
            for(let i=0;i<size;i++)
            {
                let seg = new Segment(x,y+i,this)
                this.segments.push(seg);
                this.field[x][y+i] = seg;
            }
        this.placing = placing; //Zmienna logiczna - czy statek jest w danym momencie umieszczany, czy został już umieszczony.
    }

    isDead() //Czy wszystkie segmenty statku zostały zestrzelone
    {
        let dead = true;
        this.segments.forEach(seg => 
        {
            dead &= seg.dead;
        });
        return dead;
    }

    draw(c) //Rysowanie statku - używane tylko przy umieszczaniu statku na planszy
    {
        this.segments.forEach(seg=>seg.draw(c));
    }

    drawBoundaries(c) //Podświetlanie na czerwono nielegalnych miejsc umieszczenia statku
    {
        let invalidCells = [];
        this.segments.forEach(seg => seg.getBoundaries(invalidCells));
        let i = 0;
        while(invalidCells[i])
        {
            let j = 0;
            while(invalidCells[j])
            {
                if(i!=j && invalidCells[i].x == invalidCells[j].x && invalidCells[i].y == invalidCells[j].y)
                {
                    invalidCells.splice(j,1,);
                    j--;
                }
                j++;
            }
            i++;
        }
        invalidCells.forEach(ic =>
        {
            c.fillStyle = "rgba(255,0,0,0.3)";
            c.fillRect(ic.x*scale,ic.y*scale,scale,scale);
        });
    }

    isValid(field) //Czy statek może znajdować się w danej pozycji
    {
        var valid = true;
        this.segments.forEach(segment => 
        {
            valid &= segment.check(field);
        });
        return valid;
    }
}