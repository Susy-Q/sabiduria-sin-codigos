// Lanzador local para Windows. Abra este archivo con doble clic.
// Utiliza Windows Script Host para encontrar Node.js e iniciar el curso privado.
(function () {
  var shell = new ActiveXObject("WScript.Shell");
  var files = new ActiveXObject("Scripting.FileSystemObject");
  var appFolder = files.GetParentFolderName(WScript.ScriptFullName);
  var runtimeFolder = shell.ExpandEnvironmentStrings("%LOCALAPPDATA%") + "\\OpenAI\\Codex\\runtimes\\cua_node";

  function findNode(folderPath) {
    if (!files.FolderExists(folderPath)) return null;
    var folder = files.GetFolder(folderPath);
    var fileItems = new Enumerator(folder.Files);
    for (; !fileItems.atEnd(); fileItems.moveNext()) {
      var file = fileItems.item();
      if (String(file.Name).toLowerCase() === "node.exe") return file.Path;
    }
    var folders = new Enumerator(folder.SubFolders);
    for (; !folders.atEnd(); folders.moveNext()) {
      var found = findNode(folders.item().Path);
      if (found) return found;
    }
    return null;
  }

  var nodePath = findNode(runtimeFolder);
  if (!nodePath) {
    shell.Popup(
      "No se encontró el entorno local necesario para iniciar el curso.\n\n" +
      "Abra ABRIR-CURSO-PRIVADO.html para ver las instrucciones.",
      0,
      "Sabiduría Sin Códigos",
      16
    );
    WScript.Quit(1);
  }

  var launcherPath = files.BuildPath(appFolder, "iniciar-curso.js");
  if (!files.FileExists(launcherPath)) {
    shell.Popup("No se encontró iniciar-curso.js.", 0, "Sabiduría Sin Códigos", 16);
    WScript.Quit(1);
  }

  shell.Run('"' + nodePath + '" --no-warnings "' + launcherPath + '"', 1, false);
})();
