/**
 * Module for managing Objetivos
 * @module Objetivo
 */

/**
 * Gets all objectives documents for the list
 */
const getAll = async (firestore, req, res) => {
    console.log("objetivos.getAll start");
  
    // Check if has access to add (is admin)
    if (!req.user.admin) {
      return res.send({
        error: true,
        message: "No tienes acceso a esta accion",
      });
    }
  
    try {
      const snapshot = await firestore.collection("objetivos").get();
      const objectives = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
      return res.send({ error: false, data: objectives });
    } catch (error) {
      console.log("error :>> ", error);
      return res.send({ error: true, message: err.message });
    }
  };
  
  /**
   * Adds a new objective to the 'objetivos' collection
   */
  const updateOne = async (firestore, req, res) => {
    console.log("objetivos.add start", req.body);
  
    // Check if has access to add (is admin)
    if (!req.user.admin) {
      return res.send({
        error: true,
        message: "No tienes acceso a esta accion",
      });
    }
  
    const { id, decanatoId, p, cg, oc1, oc2, oc3} = req.body;
  
    try {
        const newObjective = {
          decanatoId,
          p,
          cg,
          oc1,
          oc2,
          oc3
        };
        var objetivoSnap = await firestore.collection('objetivos').doc(id).get();
        if (!objetivoSnap.exists){
            const docref = await firestore.collection("objetivos").add(newObjective);
            newObjective.id = docref.id;
        
            return res.send({
              error: false,
              data: newObjective,
            }); 
        }
      
    //   Update new objective
      await firestore.collection('objetivos').doc(id).update(newObjective);
		return res.send({
			error: false,
			data: true
		})
    } catch (error) {
      console.log("error :>> ", error);
      return res.send({ error: true, message: err.message });
    }
  };

  
  module.exports = {
    getAll,
    updateOne
  };