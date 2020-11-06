/**
 * Adds a new event to the 'eventos' collection
 */
const add = async (firestore, req, res) => {
  console.log("add start", req.body);

  // Check if has access to add (is admin)
  if (!req.user.admin) {
    return res.send({
      error: true,
      message: "No tienes acceso a esta accion",
    });
  }

  const { name, eventResponsible, eventDates } = req.body;

  const snapshot = await firestore
    .collection("eventos")
    .where("nombre", "==", name)
    .get();

  if (snapshot.docs.length > 0) {
    return res.send({
      error: true,
      message: "Ya existe un evento con ese nombre.",
    });
  }

  const newEvent = {
    nombre: name,
    responsable: eventResponsible,
    fechas: eventDates,
    fecha_creada: new Date(),
  };

  const docref = await firestore.collection("eventos").add(newEvent);
  newEvent.id = docref.id;

  res.send({
    error: false,
    data: newEvent,
  });
};

module.exports = {
  add,
};
