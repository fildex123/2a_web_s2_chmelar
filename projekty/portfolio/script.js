const chart = new Chart(document.getElementById('myChart'), {
  type: 'pie',
  data: {
    labels: ['A', 'B', 'C'],
    datasets: [{
      data: [40, 35, 25],
      backgroundColor: ['#7F77DD', '#1D9E75', '#D85A30'],
      hoverOffset: 18,
    }]
  },
  options: {
    animation: { animateRotate: true, duration: 900, easing: 'easeOutBounce' },
    responsive: true,
    maintainAspectRatio: false,
  }
});