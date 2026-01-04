
const db = firebase.database();
const eventosRef = db.ref("eventos");
const pagosRef = db.ref("pagos");


document.addEventListener("DOMContentLoaded", () => {

    const calendar = new FullCalendar.Calendar(
        document.getElementById("calendar"), {
            initialView: "dayGridMonth",
            events: []
        }
    );
    calendar.render();

    function actualizarUI(eventos) {
        const tbody = document.getElementById("eventos-table");
        tbody.innerHTML = "";
        calendar.removeAllEvents();

        let total = 0;

        eventos.forEach(evento => {
            if (evento.ir) total += evento.precio;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${evento.fecha}</td>
                <td>${evento.nombre}</td>
                <td>${evento.lugar}</td>
                <td>$${evento.precio.toFixed(2)}</td>
                <td>
                    <input type="checkbox" ${evento.ir ? "checked" : ""}>
                </td>
            `;

            row.querySelector("input").addEventListener("change", e => {
                eventosRef.child(evento.id).update({ ir: e.target.checked });
            });

            tbody.appendChild(row);

            calendar.addEvent({
                title: evento.nombre,
                start: evento.fecha,
                allDay: true
            });
        });

        document.getElementById("total").textContent = total.toFixed(2);
        document.getElementById("falta").textContent = (total - totalPagado).toFixed(2);

    }

    eventosRef.on("value", snapshot => {
        const data = snapshot.val() || {};
        const eventos = Object.keys(data).map(id => ({
            id,
            ...data[id]
        })).sort((a,b)=> new Date(a.fecha)-new Date(b.fecha));

        actualizarUI(eventos);
    });

    document.getElementById("evento-form").addEventListener("submit", e => {
        e.preventDefault();

        const nuevoEvento = {
            nombre: nombre.value,
            fecha: fecha.value,
            lugar: lugar.value,
            precio: parseFloat(precio.value) || 0,
            ir: false
        };

        eventosRef.push(nuevoEvento);
        e.target.reset();
    });

    let totalPagado = 0;

pagosRef.on("value", snapshot => {
    const data = snapshot.val() || {};
    totalPagado = Object.values(data)
        .reduce((acc, pago) => acc + pago.monto, 0);

    document.getElementById("pagado").textContent = totalPagado.toFixed(2);
});
document.getElementById("agregar-pago").addEventListener("click", () => {
    const input = document.getElementById("pago-input");
    const monto = parseFloat(input.value);

    if (!isNaN(monto) && monto > 0) {
        pagosRef.push({
            monto: monto,
            fecha: new Date().toISOString()
        });

        input.value = "";
    }
});



});
