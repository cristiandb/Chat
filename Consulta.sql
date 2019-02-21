//Consulta para saber los amigos y grupos de cada amigo, de un determinado usuario
CREATE PROCEDURE `consulta_amigos_grupos` (IN codigoUsuario INT)
SELECT g.idGrupos, g.idAmigo, g.NombreGrupo, g.Amigo
FROM tl_am_pertenece_gr p
INNER JOIN (
Select g.idGrupos, am.idAmigo, g.nombre as NombreGrupo, am.nombre  as Amigo
FROM tl_grupos g
INNER JOIN (
Select a.idAmigo, p.nombre, a.idUsuario
FROM tl_usuario_perfil p
INNER JOIN (
SELECT a.idAmigo, u.idUsuario FROM tl_usuario_id u
INNER JOIN tl_amigo a ON u.idUsuario = a.idUsuario WHERE a.idUsuario = codigoUsuario) a
ON p.idUsuario = a.idAmigo) am
ON g.idUsuario = am.idUsuario
ORDER BY am.idAmigo ASC) g
ON p.idUsuario = g.idAmigo
WHERE p.idGrupos = g.idGrupos
ORDER BY idGrupos ASC;