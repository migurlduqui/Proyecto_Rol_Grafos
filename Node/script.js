export class Node {

    constructor(x,y,Title,subtittle){
        this.x = x;
        this.y = y;
        this.Title = Title;
        this.subtittle = subtittle;
        this.image = "default.png";
        this.Parent = document.createElement("div");

    }


    Display(){
        this.Parent.className = "square";
        this.Parent.style.left = this.x + "px";
        this.Parent.style.top = this.y + "px";

        
        var image = document.createElement("img");
        image.src = this.image; // Set image source
        image.style.float = "left"; // Align image to the left
        image.draggable = false;
        

        var Title = document.createElement("div");
        Title.contentEditable = true;
        Title.innerText = this.Title;

        //second text element
        var subtittle = document.createElement("div");
        subtittle.contentEditable = true;
        subtittle.innerText = this.subtittle;

        this.Parent.append(image,Title,subtittle);
        return this.Parent;
    }
    // Method to add mouse event listeners to the node
    addEventListeners() {
        this.Parent.addEventListener("mousedown", (event) => {
            const offsetX = event.clientX - this.x;
            const offsetY = event.clientY - this.y;

            const moveSquare = (event) => {
                this.x = event.clientX - offsetX;
                this.y = event.clientY - offsetY;
                this.Parent.style.left = this.x + "px";
                this.Parent.style.top = this.y + "px";
            };

            document.addEventListener("mousemove", moveSquare);

            document.addEventListener("mouseup", function onMouseUp() {
                document.removeEventListener("mousemove", moveSquare);
                document.removeEventListener("mouseup", onMouseUp);
            });
        });

        const image = this.Parent.querySelector("img");
        image.addEventListener("click", () => {
            const newImagePath = prompt("Enter new path for the image:", this.image);
            if (newImagePath) {
                this.image = newImagePath;
                image.src = newImagePath; // Update image source
            }
        });


    }
}