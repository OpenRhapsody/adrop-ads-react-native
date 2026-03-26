package io.adrop.native

import android.view.View
import android.view.ViewGroup

class BackfillRefreshObserver(
    private val targetView: ViewGroup,
    private val onBackfillRefresh: () -> Unit
) : ViewGroup.OnHierarchyChangeListener {

    private var isAttached = false

    fun attach() {
        if (isAttached) return
        isAttached = true
        targetView.setOnHierarchyChangeListener(this)
    }

    fun detach() {
        if (!isAttached) return
        isAttached = false
        targetView.setOnHierarchyChangeListener(null)
    }

    override fun onChildViewAdded(parent: View?, child: View?) {
        if (child == null) return

        val className = child.javaClass.name
        if (className.contains("NativeAdView") && className.contains("google")) {
            onBackfillRefresh()
        }
    }

    override fun onChildViewRemoved(parent: View?, child: View?) {
    }
}
