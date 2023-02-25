export default () => {
    // fetch assignment datas
    const allAssignments = await fetchSummaries()
    const hidedAssignments = await fetchHided()
    const courseURLs = getCourseURLs()

    const viewer = new AssignmentViewer(
        allAssignments,
        hidedAssignments,
        courseURLs
    )
    Assignment.inputClick = viewer.inputClick

    // show toggles
    document.getElementById('toggles').style.display = 'flex'
    document.getElementById('toggle-extra-ass-hide').onchange = (
        e: HTMLInputEvent
    ) => {
        viewer.showExtraAssIs(e.target.checked)
        viewer.repaint()
    }
    document.getElementById('toggle-hide').onchange = (e: HTMLInputEvent) => {
        viewer.showDisableAssIs(e.target.checked)
        viewer.repaint()
    }

    viewer.repaint()
}